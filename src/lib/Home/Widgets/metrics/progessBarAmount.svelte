<script>
    export let progress;
    export let target;
    export let hastarget;

    $: progressWidth = `${Math.min(progress, target)}%`;
    $: targetWidth = progress < target ? `${target - progress}%` : `${progress - target}%`;
    $: leftCircle = progress < target ? `${progress - 2.3}%` : `${progress - 2.3}%`;
    $: tooltip = progress < target ? `${target - 2.3}%` : `${target - 2.3}%`;
    $: percentage =
        progress < target ? (target - progress) / target * 100 : (progress - target) / progress * 100;
    $: isEqual = !hastarget;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    $: offset = circumference - (progress / 100) * circumference;

    const angle = (progress / 100) * 180;

    $: circleX = 50 + radius * Math.cos((180 - angle) * Math.PI / 180);
    $: circleY = 50 - radius * Math.sin((180 - angle) * Math.PI / 180);

    function getPath(outerRadius, innerRadius, cornerRadius, percentage) {
        const angle = percentage * 180;
        const outerPointX = outerRadius * Math.cos((180 - angle) * Math.PI / 180);
        const outerPointY = -outerRadius * Math.sin((180 - angle) * Math.PI / 180);
        const innerPointX = innerRadius * Math.cos((180 - angle) * Math.PI / 180);
        const innerPointY = -innerRadius * Math.sin((180 - angle) * Math.PI / 180);

        const left = `M ${-outerRadius},0 
            A ${outerRadius},${outerRadius} 0 0 1 
            ${outerPointX},${outerPointY}
            L ${innerPointX},${innerPointY}
            A ${innerRadius},${innerRadius} 0 0 0 ${-innerRadius},0       
            Q ${-innerRadius},${cornerRadius} 
            ${-innerRadius-cornerRadius},${cornerRadius} 
            H ${-outerRadius+cornerRadius}
            Q ${-outerRadius},${cornerRadius} 
            ${-outerRadius},0 
            Z`;

        const right = `M ${outerPointX},${outerPointY}
            A ${outerRadius},${outerRadius} 0 0 1 
            ${outerRadius},0
            Q ${outerRadius},${cornerRadius} 
            ${outerRadius-cornerRadius},${cornerRadius} 
            H ${innerRadius+cornerRadius}
            Q ${innerRadius},${cornerRadius} 
            ${innerRadius},0 
            A ${innerRadius},${innerRadius} 0 0 0 
            ${innerPointX},${innerPointY}       
            Z`;


        const intersectionX = (outerPointX + innerPointX) / 2;
        const intersectionY = (outerPointY + innerPointY) / 2;

        return { left, right, intersectionX, intersectionY };
    }

    $: paths = getPath(120, 110, 6, 0.23);
</script>

<div class="w-full flex justify-center h-full">
    <svg viewBox="0 0 300 300" class="progress-arch">
        <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
            </linearGradient>
        </defs>
        <g transform='translate(150,150)'>
            <path fill='url(#blueGradient)' d={paths.left}/>
            <path stroke='grey' fill='none' d={paths.right}/>
            <circle cx={paths.intersectionX} cy={paths.intersectionY} r="8" class="progress-circle"/>
            <text x="0" y="10" text-anchor="middle" class="progress-text">{progress}%</text>
        </g>
    </svg>
</div>



<style>
    .progress-arch {
        width: 100%;
        height: 100%;
    }
    .progress-bg {
        fill: red;
        stroke: #e2e8f0; /* Light background color */
        stroke-width: 10;
    }
    .progress-arc {
        fill: none;
        stroke: #3b82f6; /* Blue color */
        stroke-width: 10;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.3s;
    }
    .progress-circle {
        fill: #436697; /* Dark color */
        stroke: #b7babd;
     
        stroke-width: 2;
    }
    .progress-text {
        font-size: 36px;
        fill: #b7babd;
        font-weight: bold;
    }
</style>
