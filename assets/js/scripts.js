const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener('load', initJsToggle);

function initJsToggle() {
    $$('.js-toggle').forEach((button) => {
        const target = button.getAttribute('toggle-target');
        if (!target) {
            document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
        }
        button.onclick = (e) => {
            e.preventDefault();
            if (!$(target)) {
                return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $(target).classList.contains('hide');

            requestAnimationFrame(() => {
                $(target).classList.toggle('hide', !isHidden);
                $(target).classList.toggle('show', isHidden);
            });
        };
        document.onclick = function (e) {
            if (!e.target.closest(target)) {
                const isHidden = $(target).classList.contains('hide');
                if (!isHidden) {
                    button.click();
                }
            }
        };
    });
}

window.addEventListener('load', () => {
    const links = $$('.js-dropdown-list > li > a');

    links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest('li');
            item.classList.toggle('navbar__item--active');
        };
    });
});
