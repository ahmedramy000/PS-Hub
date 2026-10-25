// ديار بلايستيشن — سلوك الموقع (قائمة الموبايل + صور الأغلفة + حجز المعاد)

// ✏️ غيّر رقم الواتساب هنا بصيغة دولية من غير + أو أصفار زيادة (مثال: مصر 201xxxxxxxxx)
var WHATSAPP_NUMBER = '201000000000';

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- التنقل بين "الصفحات" جوه نفس ملف الـ HTML ----------
     الموقع ملف واحد بس الديزاين مقسّم views منفصلة (زي صفحات حقيقية)،
     وبيتنقل بينها بالهاش في الرابط (#games, #cod, ...) من غير ريلود. */

  var VIEW_IDS = ['home', 'games', 'cod', 'nfs', 'fifa', 'spiderman', 'residentevil', 'emulators', 'booking', 'contact'];

  function showView(rawHash) {
    var target = (rawHash || '').replace('#', '') || 'home';
    // "#services" رابط فرعي جوه صفحة الرئيسية، مش صفحة لوحدها
    var viewId = target === 'services' ? 'home' : target;
    if (VIEW_IDS.indexOf(viewId) === -1) viewId = 'home';

    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + viewId);
    });

    document.querySelectorAll('.nav-links a, .mobile-panel a').forEach(function (a) {
      var linkTarget = (a.getAttribute('href') || '').replace('#', '');
      a.classList.toggle('active', linkTarget === target);
    });

    window.scrollTo(0, 0);
    var heading = document.querySelector('#view-' + viewId + ' h2');
    document.title = (viewId !== 'home' && heading ? heading.textContent + ' — ' : '') + 'PS Hub';

    if (target === 'services') {
      var svc = document.getElementById('services');
      if (svc) {
        // ندي شوية وقت للـ view يظهر الأول، بعدين نعمل سكرول للخدمات
        setTimeout(function () { svc.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
      }
    }
  }

  window.addEventListener('hashchange', function () { showView(location.hash); });
  showView(location.hash);

  /* ---------- قائمة الموبايل (هامبرجر) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // قفل القائمة تلقائيًا بعد الضغط على أي رابط
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- أغلفة الألعاب: صورة حقيقية لو موجودة، وإلا بديل ---------- */
  // كل كارت لعبة فيه <img src="assets/images/games/...jpg"> يحاول يحمّل
  // صورة الغلاف. لو الصورة مش مضافة لسه، بيظهر بديل بسيط بدل ما الكارت يبوّظ.
  document.querySelectorAll('.game-cover img').forEach(function (img) {
    img.addEventListener('error', function () {
      var cover = img.closest('.game-cover');
      if (!cover) return;
      img.remove();
      cover.classList.add('pending');
      cover.insertAdjacentHTML('afterbegin',
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/>' +
        '<circle cx="12" cy="13" r="3.4" stroke="currentColor" stroke-width="1.6"/>' +
        '<path d="M8 6l1.5-2h5L16 6" stroke="currentColor" stroke-width="1.6"/></svg>'
      );
      var hint = document.createElement('span');
      hint.className = 'hint';
      hint.textContent = 'ضيف صورة الغلاف هنا';
      cover.appendChild(hint);
    }, { once: true });
  });

  /* ---------- مودال تفاصيل اللعبة (ريجن/رقم/تحديث/إضافات/أونلاين/سعر) ----------
     كل كارت لعبة فيه data-region / data-number / data-update / data-additions
     / data-online / data-price. دوس على الكارت يفتح المودال ويعرض القيم دي. */

  var gameModal = document.getElementById('game-modal');

  if (gameModal) {
    var modalTitle = document.getElementById('game-modal-title');
    var modalFields = ['region', 'number', 'update', 'languages', 'online', 'price'];

    function openGameModal(card) {
      var name = card.querySelector('.game-name');
      modalTitle.textContent = name ? name.textContent : '';

      modalFields.forEach(function (field) {
        var val = (card.getAttribute('data-' + field) || '').trim();
        var out = gameModal.querySelector('[data-out="' + field + '"]');
        if (out) out.textContent = val || '—';
      });

      // الإضافات: بتتكتب في data-additions مفصولة بفاصلة (,)
      // زي كده: data-additions="خرائط جديدة, أسلحة جديدة"
      // لو اللعبة ملهاش إضافات، سيب data-additions فاضي وهيكتب "خالية من الإضافات"
      var additionsList = gameModal.querySelector('[data-out="additions"]');
      if (additionsList) {
        var raw = (card.getAttribute('data-additions') || '').trim();
        var items = raw ? raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
        additionsList.innerHTML = '';
        if (items.length === 0) {
          additionsList.innerHTML = '<li class="empty">خالية من الإضافات</li>';
        } else {
          items.forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            additionsList.appendChild(li);
          });
        }
      }

      gameModal.hidden = false;
    }

    function closeGameModal() {
      gameModal.hidden = true;
    }

    document.querySelectorAll('.game-card').forEach(function (card) {
      card.addEventListener('click', function () { openGameModal(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGameModal(card);
        }
      });
    });

    gameModal.querySelector('.game-modal-close').addEventListener('click', closeGameModal);
    gameModal.addEventListener('click', function (e) {
      if (e.target === gameModal) closeGameModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !gameModal.hidden) closeGameModal();
    });
  }

  /* ---------- حجز معاد + خصم أول/تاني تعامل ----------
     ملاحظة: التتبع هنا محلي على المتصفح (localStorage)، يعني
     بيفرّق بين "أول زيارة من الموقع" و"زيارة بعد ما حجز قبل كده"
     على نفس الجهاز/المتصفح. لو عايز تتبع حقيقي للعملاء يربط بأرقامهم
     فعلاً، ده محتاج سيرفر وقاعدة بيانات مش مجرد صفحة ثابتة. */

  var HAS_BOOKED_KEY = 'dp_has_booked';
  var COUPON_KEY = 'dp_coupon';

  function makeCoupon(percent) {
    var code = 'DP' + percent + '-' + Math.floor(1000 + Math.random() * 9000);
    return code;
  }

  function getDiscountState() {
    var hasBooked = localStorage.getItem(HAS_BOOKED_KEY) === 'true';
    var percent = hasBooked ? 25 : 50;
    var coupon = localStorage.getItem(COUPON_KEY);
    // كوبون جديد لو مفيش واحد محفوظ، أو لو النسبة اتغيرت (من 50 لـ 25 بعد أول حجز)
    if (!coupon || coupon.indexOf('DP' + percent + '-') !== 0) {
      coupon = makeCoupon(percent);
      localStorage.setItem(COUPON_KEY, coupon);
    }
    return { hasBooked: hasBooked, percent: percent, coupon: coupon };
  }

  function renderBookingBanner() {
    var banner = document.querySelector('.booking-banner');
    if (!banner) return;
    var state = getDiscountState();
    var titleEl = banner.querySelector('.booking-banner-title');
    var subEl = banner.querySelector('.booking-banner-sub');
    var codeEl = banner.querySelector('.coupon-code');

    if (state.hasBooked) {
      titleEl.textContent = 'خصم 25% على حجزك ده كعميل قبل كده';
      subEl.textContent = 'الخصم ده لعملاء ديار بلايستيشن اللي حجزوا قبل كده عن طريق الموقع.';
    } else {
      titleEl.textContent = 'خصم 50% على أول تعامل معانا عن طريق الموقع';
      subEl.textContent = 'العرض ده لأول مرة بس — من المرة اللي بعدها الخصم بيبقى 25%.';
    }
    codeEl.textContent = state.coupon;
    return state;
  }

  function renderPricesDiscount() {
    var badges = document.querySelectorAll('[data-discount-badge]');
    if (!badges.length) return;
    var state = getDiscountState();
    badges.forEach(function (badge) {
      badge.textContent = state.hasBooked
        ? 'خصم 25% كعميل قبل كده'
        : 'خصم 50% لأول مرة';
      badge.hidden = false;
    });
  }

  renderPricesDiscount();

  var bookingForm = document.querySelector('.booking-form');
  if (bookingForm) {
    renderBookingBanner();

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var state = getDiscountState();

      var name = bookingForm.querySelector('[name="name"]').value.trim();
      var phone = bookingForm.querySelector('[name="phone"]').value.trim();
      var service = bookingForm.querySelector('[name="service"]').value;
      var date = bookingForm.querySelector('[name="date"]').value;
      var time = bookingForm.querySelector('[name="time"]').value;
      var notes = bookingForm.querySelector('[name="notes"]').value.trim();

      var lines = [
        'عايز أحجز معاد من موقع ديار بلايستيشن:',
        'الاسم: ' + name,
        'رقم التواصل: ' + phone,
        'الخدمة: ' + service,
        'التاريخ المفضل: ' + (date || '-') + (time ? (' الساعة ' + time) : ''),
      ];
      if (notes) lines.push('ملاحظات: ' + notes);
      lines.push('كود الخصم (' + state.percent + '%): ' + state.coupon);

      var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(waUrl, '_blank');

      // بعد أول حجز، التعامل التالي هيبقى خصمه 25%
      localStorage.setItem(HAS_BOOKED_KEY, 'true');

      var confirmBox = document.querySelector('.booking-confirm');
      if (confirmBox) confirmBox.hidden = false;
      bookingForm.reset();
      renderBookingBanner();
      renderPricesDiscount();
    });
  }

});
