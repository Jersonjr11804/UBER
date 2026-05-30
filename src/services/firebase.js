import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// ─── Auth ───────────────────────────────────────────────

export const registerUser = async (email, password) => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  return userCredential.user;
};

export const loginUser = async (email, password) => {
  const userCredential = await auth().signInWithEmailAndPassword(email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await auth().signOut();
};

export const getCurrentUser = () => {
  return auth().currentUser;
};

// ─── Firestore — Users ──────────────────────────────────

export const saveUserProfile = async (uid, profileData) => {
  await firestore().collection('users').doc(uid).set(profileData, { merge: true });
};

export const getUserProfile = async (uid) => {
  const doc = await firestore().collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
};

export const updateUserProfile = async (uid, updatedData) => {
  await firestore().collection('users').doc(uid).update(updatedData);
};

// ─── Firestore — Trips ──────────────────────────────────

export const saveTripToHistory = async (uid, tripData) => {
  await firestore()
    .collection('users')
    .doc(uid)
    .collection('trips')
    .add({
      ...tripData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};

export const getTripHistory = async (uid) => {
  const snapshot = await firestore()
    .collection('users')
    .doc(uid)
    .collection('trips')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};