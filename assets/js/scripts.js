const sm_MaxWidth = 575.98;

let specialitesSliderIndex = 1;
let isMouseDown = false;

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
    initJsToggle();

    $('.navbar__overlay').on('click', (e) => {
        const targetId = $(e.target).attr('toggle-target');
        const $target = $(targetId);

        $target.toggleClass('hide', true);
        $target.toggleClass('show', false);
    });

    // Specialities
    const viewportWidth = $(window).width();
    console.log({ viewportWidth });

    if (viewportWidth <= sm_MaxWidth) {
        setSpecialitiesPosition();
    }
    $(window).on('resize', function (e) {
        const viewportWidth = $(window).width();
        if (viewportWidth <= sm_MaxWidth) {
            setSpecialitiesPosition();
        }
    });
});

const setSpecialitiesPosition = () => {
    const $specialities = $('.speciality');
    let dots = [];

    // Add dots to slider
    $specialities.each(function (index) {
        dots.push(createDotInSlider(index, specialitesSliderIndex));
    });
    $('.specialities .slider')
        .append($(dots.join('')))
        .on('click', '.slider__dot', handleClickSpecialitiesSlider);

    // Add clones before first element and after last element
    const $firstSpeciality = $specialities.eq(0);
    const $lastSpeciality = $specialities.eq(-1);

    $firstSpeciality.before($lastSpeciality.clone());
    $lastSpeciality.after($firstSpeciality.clone());

    // Add event handlers to list track
    const $specialitiesList = $('.specialities__list');
    $specialitiesList.on({
        mousedown: handleMouseDownOnSpeciality,
        mouseleave: handleMouseLeaveOnSpeciality,
        transitionend: handleTransitionendOnSpeciality,
        // mouseenter: function (e) {
        //     $(e.target).css('cursor', 'grab');
        // },
    });
    updateTranslateX($specialitiesList, specialitesSliderIndex);
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

const handleClickSpecialitiesSlider = (e) => {
    const $target = $(e.target);
    const targetIndex = parseInt($target.attr('slider-index'));

    if (targetIndex === specialitesSliderIndex) {
        return;
    }

    specialitesSliderIndex = targetIndex;

    activateDotInSlider($target);

    updateTranslateX(
        $('.specialities__list').removeClass('transition-none'),
        specialitesSliderIndex
    );
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

function handleMouseDownOnSpeciality(e) {
    e.preventDefault();

    const $specialitiesList = $(this);
    const originalTranslateXValue = getTranslateXValue($specialitiesList);

    $specialitiesList.addClass('transition-none');

    $('body')
        .on({
            mousemove: handleMouseMoveOnSpeciality,
            mouseup: handleMouseUpOnSpeciality,
        })
        .data({
            $specialitiesList,
            numberOfChildren: $specialitiesList.children().length - 2,
            originalTranslateXValue,
            oldX: e.pageX,
            oldY: e.pageY,
            isMouseDown: true,
        });
}

function handleMouseMoveOnSpeciality(e) {
    e.preventDefault();

    const $this = $(this);
    const { $specialitiesList, oldX, oldY, isMouseDown } = $this.data();

    if (!isMouseDown) {
        return;
    }

    const newX = e.pageX;
    const newY = e.pageY;

    const dx = newX - oldX;
    const dy = newY - oldY;

    // if (Math.abs(dy) > 3) {
    //     return;
    // }

    const mouseDistance = dx * 1;

    const oldTranslateXValue = getTranslateXValue($specialitiesList);
    const translateXValue = oldTranslateXValue + mouseDistance;

    $specialitiesList.css({
        transform: `translateX(${translateXValue}px)`,
    });

    $this.data({
        oldX: newX,
        oldY: newY,
    });
}

function handleMouseUpOnSpeciality(e) {
    e.preventDefault();

    const $this = $(this);
    const { $specialitiesList, originalTranslateXValue, numberOfChildren } =
        $this.data();
    const newTranslateXValue = getTranslateXValue($specialitiesList);

    const distance = newTranslateXValue - originalTranslateXValue;
    const specialitiesListWidth = $specialitiesList.outerWidth();
    const threshold = specialitiesListWidth * 0.25;

    if (Math.abs(distance) > threshold) {
        specialitesSliderIndex += distance > 0 ? -1 : 1;
        if (
            specialitesSliderIndex >= 0 &&
            specialitesSliderIndex < numberOfChildren
        ) {
            activateDotInSlider(
                $(
                    `.specialities .slider__dot[slider-index='${specialitesSliderIndex}']`
                )
            );
        } else {
            const index =
                specialitesSliderIndex === -1 ? numberOfChildren - 1 : 0;
            activateDotInSlider(
                $(`.specialities .slider__dot[slider-index='${index}']`)
            );
        }
    }

    $specialitiesList.removeClass('transition-none');
    updateTranslateX($specialitiesList, specialitesSliderIndex);

    $(this)
        .data({
            isMouseDown: false,
        })
        .off({
            mousemove: handleMouseMoveOnSpeciality,
            mouseup: handleMouseUpOnSpeciality,
        });
}

function handleTransitionendOnSpeciality(e) {
    e.preventDefault();

    const $specialitiesList = $(this);
    const numberOfChildren = $specialitiesList.children().length - 2;

    if (
        specialitesSliderIndex < 0 ||
        specialitesSliderIndex >= numberOfChildren
    ) {
        specialitesSliderIndex =
            specialitesSliderIndex === -1 ? numberOfChildren - 1 : 0;

        $specialitiesList.addClass('transition-none');
        updateTranslateX($specialitiesList, specialitesSliderIndex);
    }
}

const handleMouseLeaveOnSpeciality = (e) => {
    e.preventDefault();

    $('body').trigger('mouseup');
};
