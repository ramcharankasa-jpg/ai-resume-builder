import {
  auth, db, storage, provider,
  signInWithPopup, signOut, onAuthStateChanged,
  doc, setDoc, getDoc,
  ref, uploadBytes, getDownloadURL
} from "./firebase-config.js";

// ---- CONFIG ----
// Point this to your deployed Render backend, e.g. "https://your-app.onrender.com"
const BACKEND_URL = "http://localhost:5000";

const el = (id) => document.getElementById(id);
let currentUser = null;
let photoDataUrl = null;

// ---------- AUTH ----------
el("loginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
  } catch (err) {
    console.error(err);
    el("statusMsg").textContent = "Login failed: " + err.message;
  }
});

el("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    el("userEmail").textContent = user.email;
    el("userEmail").classList.remove("hidden");
    el("loginBtn").classList.add("hidden");
    el("logoutBtn").classList.remove("hidden");
    await loadResume(user.uid);
  } else {
    el("userEmail").classList.add("hidden");
    el("loginBtn").classList.remove("hidden");
    el("logoutBtn").classList.add("hidden");
  }
});

// ---------- LIVE PREVIEW ----------
const fields = ["fullName", "email", "phone", "summary", "skills", "experience", "education"];
fields.forEach((id) => el(id).addEventListener("input", updatePreview));

function updatePreview() {
  el("pName").textContent = el("fullName").value || "Your Name";
  el("pContact").textContent = [el("email").value, el("phone").value].filter(Boolean).join(" | ");
  el("pSummary").textContent = el("summary").value;
  el("pSkills").textContent = el("skills").value;
  el("pExperience").textContent = el("experience").value;
  el("pEducation").textContent = el("education").value;
}

// ---------- PHOTO UPLOAD ----------
el("photoUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    photoDataUrl = evt.target.result;
    el("previewPhoto").src = photoDataUrl;
    el("previewPhoto").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// ---------- AI IMPROVE BUTTONS ----------
document.querySelectorAll(".ai-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const targetId = btn.dataset.target;
    const type = btn.dataset.type;
    const textArea = el(targetId);
    const original = textArea.value.trim();
    if (!original) {
      alert("Write something first, then let AI improve it.");
      return;
    }
    btn.disabled = true;
    btn.textContent = "Improving...";
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: original, type })
      });
      const data = await res.json();
      if (data.improvedText) {
        textArea.value = data.improvedText;
        updatePreview();
      } else {
        alert("AI could not improve this. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach AI service. Is the backend running?");
    } finally {
      btn.disabled = false;
      btn.textContent = "✨ Improve with AI";
    }
  });
});

// ---------- SAVE TO FIRESTORE ----------
el("saveBtn").addEventListener("click", async () => {
  if (!currentUser) {
    alert("Please sign in first.");
    return;
  }

  let photoUrl = null;
  const fileInput = el("photoUpload");
  if (fileInput.files[0]) {
    const storageRef = ref(storage, `profilePhotos/${currentUser.uid}`);
    await uploadBytes(storageRef, fileInput.files[0]);
    photoUrl = await getDownloadURL(storageRef);
  }

  const resumeData = {
    fullName: el("fullName").value,
    email: el("email").value,
    phone: el("phone").value,
    summary: el("summary").value,
    skills: el("skills").value,
    experience: el("experience").value,
    education: el("education").value,
    photoUrl: photoUrl || null,
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "resumes", currentUser.uid), resumeData);

    // Also sync a lightweight copy to the SQL backend for analytics/search
    await fetch(`${BACKEND_URL}/api/resume/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: currentUser.uid, ...resumeData })
    });

    el("statusMsg").textContent = "Saved successfully!";
  } catch (err) {
    console.error(err);
    el("statusMsg").textContent = "Error saving: " + err.message;
  }
});

async function loadResume(uid) {
  const snap = await getDoc(doc(db, "resumes", uid));
  if (snap.exists()) {
    const data = snap.data();
    el("fullName").value = data.fullName || "";
    el("email").value = data.email || "";
    el("phone").value = data.phone || "";
    el("summary").value = data.summary || "";
    el("skills").value = data.skills || "";
    el("experience").value = data.experience || "";
    el("education").value = data.education || "";
    if (data.photoUrl) {
      el("previewPhoto").src = data.photoUrl;
      el("previewPhoto").classList.remove("hidden");
    }
    updatePreview();
  }
}

// ---------- DOWNLOAD PDF ----------
el("downloadBtn").addEventListener("click", () => {
  const element = el("resumePreview");
  html2pdf().from(element).save("resume.pdf");
});
