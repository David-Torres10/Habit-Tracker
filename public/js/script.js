document.addEventListener('DOMContentLoaded', () => {
    const habitForm = document.getElementById('habitForm');
    const trackerContainer = document.getElementById('trackerContainer');

    habitForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get the values from the form
        const habitName = document.getElementById('habitName').value;
        const habitDays = parseInt(document.getElementById('habitDays').value); // Number of days as an integer
        const habitDescription = document.getElementById('habitDescription').value;

        // Create a new habit tracker div
        const habitTracker = document.createElement('div');
        habitTracker.classList.add('tracker');

        // Add habit name, description, and container for the calendar
        habitTracker.innerHTML = `
            <h3>${habitName}</h3>
            <div class="streak-wrapper">
                <img src="fire.svg" alt="streak-icon"/>
                <p id="count"><strong>0</strong></p>
            </div>
            <p>${habitDescription}</p>
            <div class="container"></div> <!-- Calendar will be appended here -->
        `;

        // Append the new habit tracker to the container
        trackerContainer.appendChild(habitTracker);

        // Now generate the calendar and progress bar
        const calendarContainer = habitTracker.querySelector('.container');
        createCalendar(calendarContainer, habitDays);

        // Clear form and close modal
        habitForm.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('habitModal'));
        modal.hide();
    });

    // Function to generate the calendar and progress bar for each habit
    function createCalendar(container, numDays) {
        let markedDays = 0;  // Keep track of the number of marked days for this habit
        
        // Select the existing count element to update the streak number next to the SVG
        const streakCounter = container.parentElement.querySelector('#count');
    
        const progressBar = document.createElement('div'); // Create a progress bar
        progressBar.classList.add('progress');
    
        const progressBarInner = document.createElement('div'); // Inner bar for actual progress
        progressBarInner.classList.add('progress-bar', 'progress-bar-striped', 'bg-success', 'progress-bar-animated');
        progressBarInner.setAttribute('role', 'progressbar');
        progressBarInner.style.width = '0%';  // Initial progress is 0%
        progressBarInner.textContent = 
        progressBar.appendChild(progressBarInner);
    
        container.parentElement.appendChild(progressBar); // Add progress bar below the calendar
    
        // Create day boxes
        for (let i = 1; i <= numDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day');
            dayBox.textContent = i;
    
            // Add event listener for marking a day with an 'X'
            dayBox.addEventListener('click', function () {
                this.classList.toggle('x-marked');
                this.textContent = this.classList.contains('x-marked') ? 'X' : i;
                const isMarked = this.classList.contains('x-marked');
    
                // Increment or decrement the number of marked days
                markedDays += isMarked ? 1 : -1;
    
                // Calculate progress percentage
                const progressPercentage = Math.round((markedDays / numDays) * 100);
    
                // Update progress bar
                progressBarInner.style.width = progressPercentage + '%';
    
                // Update the streak counter next to the SVG
                streakCounter.textContent = `${markedDays}`;
            });
    
            container.appendChild(dayBox); // Add the dayBox to the calendar
        }
    }
});
