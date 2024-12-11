document.addEventListener('DOMContentLoaded', () => {
    const startLessonBtn = document.getElementById('start-lesson-btn');
    const lessonContent = document.getElementById('lesson-content');
    const lessonSections = document.querySelectorAll('.lesson-section');
    const nextButtons = document.querySelectorAll('.next-btn');
    const completeLessonBtn = document.getElementById('complete-lesson-btn');

    startLessonBtn.addEventListener('click', () => {
        lessonContent.style.display = 'block';
        lessonSections[0].style.display = 'block';

        // Hide the start lesson button after it's clicked
        startLessonBtn.style.display = 'none';
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            lessonSections.forEach(section => section.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
        });
    });
});

document.querySelectorAll(".timeline-marker").forEach(marker => {
    marker.addEventListener("mouseover", () => {
        marker.classList.add("hover-effect");
        setTimeout(() => marker.classList.remove("hover-effect"), 200); // Remove class after animation duration
    });
});


document.querySelectorAll(".timeline-marker").forEach(marker => {
    marker.addEventListener("click", () => {
        // Reset all markers first
        document.querySelectorAll(".timeline-marker").forEach(m => {
            m.classList.remove("clicked");
        });

        // Apply the "clicked" style to the selected marker
        marker.classList.add("clicked");

        // Update the timeline info
        const timelineInfo = document.getElementById("timeline-info");
        if (marker.id === "past-marker") {
            timelineInfo.textContent = "The past tenses describe actions completed before the present moment.";
        } else if (marker.id === "present-marker") {
            timelineInfo.textContent = "The present tenses describe actions happening now or starting earlier and continuing.";
        } else if (marker.id === "future-marker") {
            timelineInfo.textContent = "The future tenses describe actions that will occur after the present moment.";
        }
    });
});

// Existing code for sending completion data...

document.getElementById('complete-lesson-btn').addEventListener('click', async function () {
    const lessonId = this.getAttribute('data-lesson-id');

    try {
        const response = await fetch('/api/complete-lesson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lessonId }),
        });

        if (response.ok) {
            console.log('Lesson completion data sent successfully');
        } else {
            console.error('Failed to send lesson completion data', await response.json());
        }
    } catch (error) {
        console.error('Error while sending lesson completion data:', error);
    }

    // Redirect to the lesson library after a short delay
    setTimeout(() => {
        window.location.href = "/lesson-library";
    }, 1000);
});