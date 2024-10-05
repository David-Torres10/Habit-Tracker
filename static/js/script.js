document.addEventListener('DOMContentLoaded', () => {
    const habitForm = document.getElementById('habitForm');
    const trackerContainer = document.getElementById('trackerContainer');

    // Function to fetch and display existing habits
    async function fetchHabits() {
        try {
            const response = await fetch('/habits'); // Fetch habits from server
            const habits = await response.json(); // Parse JSON response

            // Call the displayHabits function to render them
            displayHabits(habits);
        } catch (error) {
            console.error("Error fetching habits:", error);
        }
    }

    // Function to display habits
    function displayHabits(habits) {
        trackerContainer.innerHTML = ''; // Clear existing content
        habits.forEach(habitData => {
            createAndDisplayHabit(habitData); // Create habit and calendar
        });
    }

    // Existing form submission handler
    habitForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const habitName = document.getElementById('habitName').value;
        const habitDays = parseInt(document.getElementById('habitDays').value);
        const habitDescription = document.getElementById('habitDescription').value;

        // Send data to the backend
        const response = await fetch('/habit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ habit_name: habitName, total_days: habitDays, description: habitDescription })
        });

        if (response.ok) {
            const habitData = await response.json(); // Get the habit data from the server
            createAndDisplayHabit(habitData); // Call the function to create the habit display
            document.getElementById('habitForm').reset();
        }
    });

    // Function to create and display the habit tracker
    function createAndDisplayHabit(habitData) {
        const habitTracker = document.createElement('div');
        habitTracker.classList.add('tracker');

        // Add habit name, description, and container for the calendar
        habitTracker.innerHTML = `
            <h3>${habitData.habit_name}</h3>
            <div class="streak-wrapper">
                <img src="fire.svg" alt="streak-icon"/>
                <p id="count"><strong>0</strong></p>
            </div>
            <p>${habitData.description}</p>
            <div class="container"></div> <!-- Calendar will be appended here -->
        `;

        // Append the new habit tracker to the container
        trackerContainer.appendChild(habitTracker);

        // Generate the calendar using the total_days from habitData
        const calendarContainer = habitTracker.querySelector('.container');
        createCalendar(calendarContainer, habitData.total_days); // Create the calendar here
    }

    // Function to generate the calendar and progress bar for each habit
    function createCalendar(container, numDays) {
        let markedDays = 0;  // Keep track of the number of marked days for this habit
        
        // Select the existing count element to update the streak number next to the SVG
        const streakCounter = container.parentElement.querySelector('#count');
    
        const progressBar = document.createElement('div'); // Create a progress bar
        progressBar.classList.add('progress');
    
        const progressBarInner = document.createElement('div'); // Inner bar for actual progress
        progressBarInner.classList.add('progress-bar', 'progress-bar-animated', 'progress-bar-striped');
        // progressBarInner.setAttribute('role', 'progressbar');
        // progressBarInner.setAttribute('aria-valuenow', '0');
        // progressBarInner.setAttribute('aria-valuemin', '0');
        // progressBarInner.setAttribute('aria-valuemax', '100');
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

    // Call fetchHabits to load existing habits on page load
    fetchHabits();
});
