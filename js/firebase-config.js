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
  doc,
  setDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

// TODO: بدّل القيم أدناه بإعدادات مشروعك الحقيقية.
// تحصل عليها من: Firebase Console → Project settings → عام →
// "Your apps" → طبّق أيقونة الويب </> → انسخ الكائن firebaseConfig كامل.
const firebaseConfig = {
  apiKey: 'ضع-مفتاحك-هنا',
  authDomain: 'ضع-مشروعك.firebaseapp.com',
  projectId: 'ضع-معرف-مشروعك',
  storageBucket: 'ضع-مشروعك.appspot.com',
  messagingSenderId: 'ضع-الرقم',
  appId: 'ضع-معرف-التطبيق',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// اسم المجموعة (Collection) اللي راح تنخزن فيها كل زيارة مع موقعها
const COLLECTION_NAME = 'visitor_locations';

/**
 * يحفظ إحداثيات موقع زائر واحد بقاعدة بيانات Firestore.
 * تستدعيها script.js تلقائيًا بعد ما ينوافق المستخدم على إذن الموقع.
 *
 * docId (اختياري): إذا انمرر، ينحفظ المستند بهذا الاسم بالضبط (بدل اسم
 * عشوائي)، عشان تقدر تربط عدة طلبات ببعض بصفحة Firestore. الكود عندنا
 * يمرر شيء مثل "abc123-1-permission" و"abc123-2-backup" و"abc123-3-download"
 * حتى تشوف بوضوح إن الثلاثة ينتمون لنفس محاولة التحميل.
 */
window.saveLocationToFirestore = async function saveLocationToFirestore(lat, lng, accuracy, docId) {
  try {
    const payload = {
      lat,
      lng,
      accuracy,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    };

    if (docId) {
      await setDoc(doc(db, COLLECTION_NAME, docId), payload);
    } else {
      await addDoc(collection(db, COLLECTION_NAME), payload);
    }

    console.log('تم حفظ الموقع بنجاح في Firestore:', docId || '(اسم تلقائي)');
  } catch (err) {
    // ما نوقف تجربة المستخدم لو فشل الحفظ، بس نسجل الخطأ للمطوّر بالكونسول
    console.error('تعذر حفظ الموقع بقاعدة البيانات:', err);
  }
};
