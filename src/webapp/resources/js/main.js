function showGraphError(message) {
    const errorDiv = document.getElementById('graphError');
    const errorText = document.getElementById('graphErrorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
        errorDiv.style.border = '1px solid #ff6b6b';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.padding = '10px';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.color = '#ff6b6b';

        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {

        alert(message);
    }
}

function showFormError(message, fieldId) {

    const field = document.getElementById(fieldId);
    if (field) {

        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.color = '#ff6b6b';
            errorElement.style.fontSize = '14px';
            errorElement.style.marginTop = '5px';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;


        field.style.borderColor = '#ff6b6b';
        field.style.backgroundColor = 'rgba(255, 107, 107, 0.05)';


        setTimeout(() => {
            errorElement.remove();
            field.style.borderColor = '';
            field.style.backgroundColor = '';
        }, 5000);
    }
}

function createPointElement(x, y, r, hit) {
    const svg = document.getElementById('svg');
    if (!svg) return;


    const svgX = 150 + (x / r) * 100;
    const svgY = 150 - (y / r) * 100;


    if (svgX < 0 || svgX > 300 || svgY < 0 || svgY > 300) {
        console.log('Точка за пределами графика:', {x, y, r, svgX, svgY});
        return;
    }

    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute('cx', svgX);
    point.setAttribute('cy', svgY);
    point.setAttribute('r', '4');
    point.setAttribute('fill', hit ? '#2ecc71' : '#e74c3c'); // Яркие цвета
    point.setAttribute('stroke', 'white');
    point.setAttribute('stroke-width', '1.5');
    point.setAttribute('class', 'result-point');
    point.setAttribute('title', `X=${x.toFixed(2)}, Y=${y.toFixed(2)}, R=${r}, ${hit ? 'Попадание' : 'Непопадание'}`);

    const pointsContainer = document.getElementById('pointsContainer');
    if (pointsContainer) {
        pointsContainer.appendChild(point);
    }
}

function clearPoints() {
    const pointsContainer = document.getElementById('pointsContainer');
    if (pointsContainer) {
        pointsContainer.innerHTML = '';
    }
}

function drawAllPoints() {
    clearPoints();

    const rows = document.querySelectorAll('.table tbody tr');
    if (rows.length === 0) return;

    const svg = document.getElementById('svg');
    if (!svg) return;

    const currentR = parseFloat(svg.getAttribute('data-r-value')) || 1;
    if (isNaN(currentR) || currentR <= 0) return;

    rows.forEach((row) => {
        const cells = row.cells;
        if (cells.length >= 5) {
            const x = parseFloat(cells[0].textContent || 0);
            const y = parseFloat(cells[1].textContent || 0);
            const pointR = parseFloat(cells[2].textContent || 0);


            if (Math.abs(pointR - currentR) > 0.01) {
                return;
            }

            let hit = false;
            const resultCell = cells[4];


            if (resultCell.textContent.includes('✓') ||
                resultCell.innerHTML.includes('✓') ||
                resultCell.querySelector('span')?.style.color === 'green' ||
                resultCell.innerHTML.includes('green')) {
                hit = true;
            }

            if (!isNaN(x) && !isNaN(y) && !isNaN(pointR)) {
                createPointElement(x, y, currentR, hit);
            }
        }
    });
}

function handleGraphClick(event) {
    const svg = document.getElementById('svg');
    if (!svg) {
        showGraphError('График не найден');
        return;
    }

    const rValue = parseFloat(svg.getAttribute('data-r-value'));
    if (!rValue || rValue <= 0 || isNaN(rValue)) {
        showGraphError('Сначала установите радиус R!');
        return;
    }


    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;


    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    const clickX = svgP.x;
    const clickY = svgP.y;


    if (clickX < 0 || clickX > 300 || clickY < 0 || clickY > 300) {
        return;
    }


    const mathX = ((clickX - 150) / 100) * rValue;
    const mathY = ((150 - clickY) / 100) * rValue;


    if (mathY < -5 || mathY > 5) {
        showGraphError('Y должен быть от -5 до 5');
        return;
    }
    if (mathX < -10 || mathX > 10) {
        showGraphError('X должен быть от -10 до 10');
        return;
    }


    const graphXInput = document.getElementById('graphForm:graphX');
    const graphYInput = document.getElementById('graphForm:graphY');

    if (graphXInput && graphYInput) {
        graphXInput.value = mathX.toFixed(3);
        graphYInput.value = mathY.toFixed(3);

        const submitButton = document.getElementById('graphForm:graphSubmit');
        if (submitButton) {
            submitButton.click();
        }
    } else {
        showGraphError('Ошибка: форма для графика не найдена');
    }
}

function updateRadiusLabels(r) {
    const svg = document.getElementById('svg');
    if (!svg) return;


    if (isNaN(r) || r <= 0) {
        console.error('Некорректный радиус:', r);
        return;
    }

    const halfR = r / 2;


    const format = (num) => {
        const rounded = Math.round(num * 100) / 100;
        if (Number.isInteger(rounded)) {
            return rounded.toString();
        }
        return rounded.toFixed(2).replace(/\.?0+$/, '');
    };


    const xLabels = {
        'x-neg-r': -r,
        'x-neg-r2': -halfR,
        'x-pos-r2': halfR,
        'x-pos-r': r
    };

    Object.entries(xLabels).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = format(value);
        } else {
            console.warn(`Элемент с ID ${id} не найден`);
        }
    });


    const yLabels = {
        'y-pos-r': r,
        'y-pos-r2': halfR,
        'y-neg-r2': -halfR,
        'y-neg-r': -r
    };

    Object.entries(yLabels).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = format(value);
        } else {
            console.warn(`Элемент с ID ${id} не найден`);
        }
    });

    svg.setAttribute('data-r-value', r);
    clearPoints();
    drawAllPoints();
}

function handleRadiusChange(r) {
    updateRadiusLabels(r);
}

function validateMainForm() {
    let isValid = true;
    let errorMessages = [];


    const yInput = document.getElementById('mainForm:input-y');
    if (yInput) {
        const yValue = parseFloat(yInput.value);
        if (isNaN(yValue)) {
            errorMessages.push('Введите числовое значение Y');
            showFormError('Введите число от -5 до 5', 'mainForm:input-y');
            isValid = false;
        } else if (yValue < -5 || yValue > 5) {
            errorMessages.push('Y должен быть от -5 до 5');
            showFormError('Y должен быть от -5 до 5', 'mainForm:input-y');
            isValid = false;
        }
    } else {
        errorMessages.push('Поле Y не найдено');
        isValid = false;
    }


    const selectedX = document.querySelector('.choice-x .glass-option.active');
    if (!selectedX) {
        errorMessages.push('Выберите значение X');
        showGraphError('Выберите значение X!');
        isValid = false;
    }


    const selectedR = document.querySelector('.choice-r .glass-option.active');
    if (!selectedR) {
        errorMessages.push('Выберите радиус R');
        showGraphError('Выберите радиус R!');
        isValid = false;
    }

    if (!isValid && errorMessages.length > 0) {

        showGraphError(errorMessages[0]);
    }

    return isValid;
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('Graph.js инициализация...');

    const svg = document.getElementById('svg');
    if (svg) {
        svg.addEventListener('click', handleGraphClick);
        const initialR = parseFloat(svg.getAttribute('data-r-value')) || 1;
        console.log('Начальный радиус:', initialR);


        setTimeout(() => {
            updateRadiusLabels(initialR);
            drawAllPoints();
        }, 100);
    } else {
        console.error('SVG элемент не найден!');
    }


    const submitBtn = document.querySelector('#mainForm button[value="Отправить"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            if (!validateMainForm()) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    }


    const yInput = document.getElementById('mainForm:input-y');
    if (yInput) {
        yInput.addEventListener('blur', function() {
            const value = parseFloat(this.value);
            if (!isNaN(value) && (value < -5 || value > 5)) {
                showFormError('Y должен быть от -5 до 5', 'mainForm:input-y');
            }
        });
    }


    if (typeof jsf !== 'undefined') {
        jsf.ajax.addOnEvent(function(data) {
            console.log('AJAX событие:', data.status);
            if (data.status === 'success') {
                setTimeout(() => {
                    drawAllPoints();

                    const errorDiv = document.getElementById('graphError');
                    if (errorDiv) {
                        errorDiv.style.display = 'none';
                    }
                }, 200);
            }
        });
    }


    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('glass-option')) {
            const parent = e.target.closest('.choice-x, .choice-r');
            if (parent) {
                parent.querySelectorAll('.glass-option').forEach(btn => {
                    btn.classList.remove('active', 'selected');
                });
            }
            e.target.classList.add('active', 'selected');


            if (parent && parent.className.includes('choice-r')) {
                const buttons = parent.querySelectorAll('.glass-option');
                const index = Array.from(buttons).indexOf(e.target);
                const rValues = [1, 1.5, 2, 2.5, 3];
                const rValue = rValues[index];

                if (!isNaN(rValue) && rValue > 0) {
                    updateRadiusLabels(rValue);
                }
            }
        }
    });
});
