const md_MaxWidth = 767.98;
const sm_MaxWidth = 575.98;

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */

function initJsToggle() {
    $('.js-toggle').each((index, button) => {
        const $button = $(button);
        const target = $button.attr('toggle-target');
        if (!target) {
            $('body').text(
                `Cần thêm toggle-target cho: ${$button.prop('outerHTML')}`
            );
        }
        $button.on('click', (e) => {
            e.preventDefault();
            const $target = $(target);
            if (!$target.length) {
                return $('body').html(`Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $target.hasClass('hide');

            requestAnimationFrame(() => {
                $target.toggleClass('hide', !isHidden);
                $target.toggleClass('show', isHidden);
            });
        });
    });
}

$(document).ready(() => {
    window.specialitesSliderIndex = 1;
    window.feedbacksSliderIndex = 2;
    window.atmosphereSliderIndex = 1;

    initJsToggle();

    $('.navbar__overlay').on('click', (e) => {
        const targetId = $(e.target).attr('toggle-target');
        const $target = $(targetId);

        $target.toggleClass('hide', true);
        $target.toggleClass('show', false);
    });

    // Specialities
    const viewportWidth = $(window).width();

    if (viewportWidth <= md_MaxWidth) {
        setUpCarousel(
            '.specialities',
            '.specialities__list',
            '.speciality',
            'specialitesSliderIndex'
        );
        setUpCarousel(
            '.atmosphere',
            '.atmosphere__list',
            '.atmosphere-img',
            'atmosphereSliderIndex'
        );
    }
    // $(window).on('resize', function (e) {
    //     const viewportWidth = $(window).width();
    //     if (viewportWidth <= sm_MaxWidth) {
    //         setUpCarousel();
    //     }
    // });
    setUpCarousel(
        '.feedbacks',
        '.feedbacks__list',
        '.feedback-card',
        'feedbacksSliderIndex'
    );

    $('.questions').on('click', '.question__icon', (e) => {
        const $question = $(e.target).closest('.question');
        $question.toggleClass('question--active');
    });
});

const setUpCarousel = (sectionClass, listClass, itemClass, sliderIndexName) => {
    const $list = $(listClass);
    const $items = $(itemClass);
    let dots = [];

    // Add dots to slider
    $items.each(function (index) {
        dots.push(createDotInSlider(index, window[sliderIndexName]));
    });
    $(`${sectionClass} .slider`)
        .append($(dots.join('')))
        .on(
            'click',
            '.slider__dot',
            {
                sliderIndexName,
                listClass,
            },
            handleClickOnSlider
        );

    // Add clones before the first element and after the last element
    const $firstItem = $items.eq(0);
    const $lastItem = $items.eq(-1);

    $firstItem.before($lastItem.clone());
    $lastItem.after($firstItem.clone());

    // Add event handlers to list track
    $list
        .data({
            sectionClass,
            sliderIndexName,
        })
        .on({
            mousedown: handleMouseDownOnItem,
            transitionend: handleTransitionendOnItem,
            'mouseenter mouseleave': function (e) {
                $(this).toggleClass('grabbable', e.type === 'mouseenter');
            },
            touchstart: handleMouseDownOnItem,
        });

    // Update transform value of list
    updateTranslateX($list, window[sliderIndexName]);
};

const createDotInSlider = (index, initIndex) => {
    const newDot = $('<div>')
        .addClass(
            `slider__dot ${index === initIndex ? 'slider__dot--active' : ''}`
        )
        .attr('slider-index', index);
    return newDot.prop('outerHTML');
};

const updateTranslateX = ($obj, sliderIndex) => {
    $obj.css({
        transform: `translateX(${$obj.width() * -(sliderIndex + 1)}px)`,
    });
};

const handleClickOnSlider = (e) => {
    const $target = $(e.target);
    const targetIndex = parseInt($target.attr('slider-index'));

    if (targetIndex === window[e.data.sliderIndexName]) {
        return;
    }

    activateDotInSlider($target);
    updateTranslateX(
        $(e.data.listClass).removeClass('transition-none'),
        targetIndex
    );

    window[e.data.sliderIndexName] = targetIndex;
};

function activateDotInSlider($target) {
    $target
        .parent()
        .find('.slider__dot--active')
        .removeClass('slider__dot--active');
    $target.addClass('slider__dot--active');
}

function getTranslateXValue($obj) {
    const transformValue = $obj.css('transform');
    const matrixValues = transformValue
        .match(/matrix\(([^)]+)\)/)[1]
        .split(', ');
    return parseInt(matrixValues[4]);
}

function handleMouseDownOnItem(e) {
    e.preventDefault();

    const $list = $(this);
    const originalTranslateXValue = getTranslateXValue($list);

    let oldX, oldY;
    if (e.type == 'touchstart') {
        // console.log('TOUCH START', {
        //     touches: e.touches,
        //     targetTouches: e.targetTouches,
        //     changedTouches: e.changedTouches,
        // });
        if (e.touches.length > 1) {
            console.log('Enough touch');
            return;
        }
        oldX = e.touches[0].pageX;
        oldY = e.touches[0].pageY;
    } else {
        oldX = e.pageX;
        oldY = e.pageY;
    }

    $list
        .addClass('transition-none')
        .data({
            numberOfChildren: $list.children().length - 2,
            originalTranslateXValue,
            oldX,
            oldY,
        })
        .on({
            'mousemove touchmove': handleMouseMoveOnItem,
            'mouseup mouseleave.stopMoving touchend touchcancel':
                handleMouseUpOnItem,
        });
}

function handleMouseMoveOnItem(e) {
    e.preventDefault();

    const $list = $(this);
    const { oldX, oldY } = $list.data();

    let newX, newY;
    if (e.type == 'touchmove') {
        // console.log('Touch move', {
        //     touches: e.touches,
        //     targetTouches: e.targetTouches,
        //     changedTouches: e.changedTouches,
        // });
        newX = e.touches[0].pageX;
        newY = e.touches[0].pageY;
    } else {
        newX = e.pageX;
        newY = e.pageY;
    }

    const dx = newX - oldX;
    const dy = newY - oldY;

    // if (Math.abs(dy) > 3) {
    //     return;
    // }

    const mouseDistance = dx * 1;

    const oldTranslateXValue = getTranslateXValue($list);
    const translateXValue = oldTranslateXValue + mouseDistance;

    $list.css({
        transform: `translateX(${translateXValue}px)`,
    });

    $list.data({
        oldX: newX,
        oldY: newY,
    });
}

function handleMouseUpOnItem(e) {
    e.preventDefault();

    const $list = $(this);
    const {
        originalTranslateXValue,
        numberOfChildren,
        sectionClass,
        sliderIndexName,
    } = $list.data();

    // console.log('TOUCH end', {
    //     touches: e.touches,
    //     targetTouches: e.targetTouches,
    //     changedTouches: e.changedTouches,
    // });

    const newTranslateXValue = getTranslateXValue($list);
    const distance = newTranslateXValue - originalTranslateXValue;
    const listWidth = $list.outerWidth();
    const threshold = listWidth * 0.25;
    let sliderIndex = window[sliderIndexName];

    if (Math.abs(distance) > threshold) {
        sliderIndex += distance > 0 ? -1 : 1;
        if (sliderIndex >= 0 && sliderIndex < numberOfChildren) {
            activateDotInSlider(
                $(`${sectionClass} .slider__dot[slider-index='${sliderIndex}']`)
            );
            window[sliderIndexName] = sliderIndex;
        } else {
            const newIndex = sliderIndex < 0 ? numberOfChildren - 1 : 0;
            activateDotInSlider(
                $(`${sectionClass} .slider__dot[slider-index='${newIndex}']`)
            );
            $list.data({ newIndex });
        }
    }

    $list.removeClass('transition-none');
    updateTranslateX($list, sliderIndex);

    $list
        .removeData([
            'numberOfChildren',
            'originalTranslateXValue',
            'oldX',
            'oldY',
        ])
        .off(
            'mousemove mouseup mouseleave.stopMoving touchmove touchend touchcancel'
        );
}

function handleTransitionendOnItem(e) {
    e.preventDefault();

    const $list = $(this);
    const { newIndex, sliderIndexName } = $list.data();

    if (newIndex !== undefined) {
        window[sliderIndexName] = newIndex;

        $list.addClass('transition-none').removeData('newIndex');
        updateTranslateX($list, newIndex);
    }
}
