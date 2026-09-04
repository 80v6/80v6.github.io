// ---------------------------------------------------------------
// إعداد Firebase (Firestore) لتخزين إحداثيات الموقع الجغرافي
// ---------------------------------------------------------------
// هذا الملف يحتاج منك خطوة وحدة قبل ما يشتغل: تعبئة firebaseConfig
// بمعلومات مشروعك من Firebase Console. راجع خطوات الإعداد بالأسفل.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

// TODO: بدّل القيم أدناه بإعدادات مشروعك الحقيقية.
// تحصل عليها من: Firebase Console → Project settings → عام →
// "Your apps" → طبّق أيقونة الويب </> → انسخ الكائن firebaseConfig كامل.
const firebaseConfig = {
  apiKey: "AIzaSyCpbQ_pADgbX3lZ5-GBnOMrAJdHUZRbVN8",
  authDomain: "krtt-dff99.firebaseapp.com",
  projectId: "krtt-dff99",
  storageBucket: "krtt-dff99.firebasestorage.app",
  messagingSenderId: "591315016510",
  appId: "1:591315016510:web:71e8b6b8bf22df5ff8aa6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// اسم المجموعة (Collection) اللي راح تنخزن فيها كل زيارة مع موقعها
const COLLECTION_NAME = 'visitor_locations';

/**
 * يحفظ إحداثيات موقع زائر واحد بقاعدة بيانات Firestore.
 * تستدعيها script.js تلقائيًا بعد ما ينوافق المستخدم على إذن الموقع.
 */
window.saveLocationToFirestore = async function saveLocationToFirestore(lat, lng, accuracy) {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      lat,
      lng,
      accuracy,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
    console.log('تم حفظ الموقع بنجاح في Firestore.');
  } catch (err) {
    // ما نوقف تجربة المستخدم لو فشل الحفظ، بس نسجل الخطأ للمطوّر بالكونسول
    console.error('تعذر حفظ الموقع بقاعدة البيانات:', err);
  }
};
