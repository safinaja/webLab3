function handleFormSubmit(data) {
    if (data.status === 'success') {
        setTimeout(drawAllPoints, 300);
        document.getElementById('graphError').style.display = 'none';
    }
}
function handleClear(data) {
    if (data.status === 'success') {
        setTimeout(() => {
            clearPoints();
            document.querySelectorAll('.glass-option.active').forEach(btn => btn.classList.remove('active'));
        }, 100);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const svg = document.getElementById('svg');
    if (svg) {
        svg.addEventListener('click', handleGraphClick);
        const r = parseFloat(svg.getAttribute('data-r-value')) || 1;
        setTimeout(() => {
            updateRadiusLabels(r);
            drawAllPoints();
        }, 300);
    }
});
