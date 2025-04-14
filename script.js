/**
 * 河津ラグジュアリーヴィラLP用 JavaScript
 * 機能:
 * 1. ハンバーガーメニューの開閉制御
 * 2. スムーススクロール (固定ヘッダー考慮)
 * 3. スクロールに応じた要素のアニメーション表示 (Intersection Observer API)
 * 4. フッターのコピーライト年の自動更新
 */
document.addEventListener('DOMContentLoaded', function() {

    /**
     * ハンバーガーメニュー機能
     */
    const navToggle = document.querySelector('.nav-toggle'); // ハンバーガーボタン
    const globalNav = document.querySelector('.global-nav'); // ナビゲーションメニュー
    const body = document.body; // body要素

    // ハンバーガーボタンとナビゲーションが存在する場合のみ実行
    if (navToggle && globalNav) {
        // ハンバーガーボタンクリック時の処理
        navToggle.addEventListener('click', function() {
            const isActive = navToggle.classList.toggle('active'); // activeクラスを付け外しし、状態を取得
            globalNav.classList.toggle('active');
            // メニュー表示中は背景(body)のスクロールを禁止、非表示時は許可
            body.style.overflow = isActive ? 'hidden' : '';
        });

        // メニュー内のリンククリックでメニューを閉じる処理
        const navLinks = globalNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // リンク先がページ内リンク (#で始まる場合) のみ処理
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    // メニューがアクティブなら閉じる
                    if (globalNav.classList.contains('active')) {
                        navToggle.classList.remove('active');
                        globalNav.classList.remove('active');
                        body.style.overflow = ''; // スクロール制限解除
                    }
                    // スムーススクロール処理は別途実行される
                }
                // 通常のページ遷移リンクの場合は、メニューを閉じる処理は不要
            });
        });

        // メニュー外をクリックした時にメニューを閉じる (任意)
        document.addEventListener('click', function(event) {
            const isClickInsideNav = globalNav.contains(event.target); // クリックがナビ内か
            const isClickOnToggle = navToggle.contains(event.target); // クリックがボタンか

            // ナビ外かつボタン外をクリックし、かつメニューが開いている場合
            if (!isClickInsideNav && !isClickOnToggle && globalNav.classList.contains('active')) {
                navToggle.classList.remove('active');
                globalNav.classList.remove('active');
                body.style.overflow = ''; // スクロール制限解除
            }
        });
    }

    /**
     * スムーススクロール機能 (固定ヘッダー考慮)
     */
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]'); // #で始まるhrefを持つリンクを取得
    const header = document.querySelector('.header'); // 固定ヘッダー要素を取得

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = link.getAttribute('href');
            // hrefが'#'だけ、'#!'で始まる、または短すぎる場合は無視
            if (href === '#' || href.startsWith('#!') || href.length < 2) {
                return;
            }

            const targetId = href.substring(1); // hrefから'#'を取り除く
            // IDが存在するか、またはname属性で要素を取得試行 (古いブラウザ互換性のためだが、基本はID)
            const targetElement = document.getElementById(targetId) || document.querySelector(`[name='${targetId}']`);

            // 対象要素が存在する場合
            if (targetElement) {
                e.preventDefault(); // デフォルトのページ内ジャンプ動作をキャンセル

                // 固定ヘッダーの高さを取得 (なければ0)
                const headerHeight = header ? header.offsetHeight : 0;
                // 対象要素のビューポート上端からの位置を取得
                const elementPosition = targetElement.getBoundingClientRect().top;
                // 最終的なスクロール位置を計算 (現在のスクロール位置 + 要素位置 - ヘッダー高さ)
                const offsetPosition = window.pageYOffset + elementPosition - headerHeight;

                // 計算した位置へスムーススクロール
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    /**
     * スクロールアニメーション機能 (Intersection Observer API)
     */
    // '.animate-on-scroll' クラスを持つすべての要素を取得
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // Intersection Observerがブラウザでサポートされているかチェック
    if ("IntersectionObserver" in window) {
        // Observerを作成。コールバック関数とオプションを渡す
        const observer = new IntersectionObserver((entries, observer) => {
            // 監視対象の要素群(entries)をループ処理
            entries.forEach(entry => {
                // 要素がビューポート内に入ったら (isIntersectingがtrue)
                if (entry.isIntersecting) {
                    // 要素のdata-delay属性から遅延時間を取得 (なければ0)
                    const delay = entry.target.dataset.delay || 0;
                    // 指定された時間(ミリ秒)後に is-visible クラスを追加してアニメーション発火
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, parseInt(delay));

                    // 一度表示されたら、その要素の監視を停止 (アニメーションを繰り返さない場合)
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -50px 0px', // 判定境界をビューポート下端から50px上に設定 (少し早めに発火)
            threshold: 0.1 // 要素が10%表示されたらコールバックを実行
        });

        // 取得した各アニメーション要素を監視対象に追加
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Intersection Observer非対応ブラウザ向けのフォールバック
        // (アニメーションなしで、最初から全要素を表示状態にする)
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
        console.log("Intersection Observer is not supported by this browser. Scroll animations disabled.");
    }

    /**
     * フッターのコピーライト年の自動更新
     */
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear(); // 現在の西暦年を設定
    }

    /**
     * Google Analytics イベントトラッキング (基本はHTML側で実装)
     * より複雑なトラッキングが必要な場合の記述場所
     */
    // 例: 特定のボタンクリックでカスタムイベント送信
    // const specialButton = document.getElementById('special-offer-button');
    // if(specialButton) {
    //     specialButton.addEventListener('click', function() {
    //         if (typeof gtag === 'function') {
    //             gtag('event', 'click', {
    //                 'event_category': 'promotion',
    //                 'event_label': 'special_offer_click'
    //             });
    //         }
    //     });
    // }

}); // End of DOMContentLoaded
