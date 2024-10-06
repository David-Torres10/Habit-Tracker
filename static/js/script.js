document.addEventListener('DOMContentLoaded', () => {
    const habitForm = document.getElementById('habitForm');
    const trackerContainer = document.getElementById('trackerContainer');

    let currentDayBoxColor = '#4bda63'; // Default color for marked days

    async function updateColorOnServer(habitId, color) {
        try {
            const response = await fetch('/habit/update-color', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ habitId: habitId, color: color })
            });

            const data = await response.json();

            if (data.success) {
                console.log('Color updated successfully:', data.color);
            } else {
                console.error('Failed to update color');
            }
        } catch (error) {
            console.error('Error in fetching color update:', error);
        }
    }

    async function updateMarkedDaysOnServer(habitId, markedDays, dayColor) {
        try {
            const response = await fetch('/habit/update-streak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ habitId, markedDays, dayColor })
            });

            const data = await response.json();
            if (data.success) {
                console.log('Marked days and color updated successfully.');
            } else {
                console.error('Failed to update streak and color.');
            }
        } catch (error) {
            console.error('Error updating streak and color:', error);
        }
    }

    async function fetchHabits() {
        try {
            const response = await fetch('/habits');
            const habits = await response.json();
            displayHabits(habits);
        } catch (error) {
            console.error("Error fetching habits:", error);
        }
    }

    function displayHabits(habits) {
        trackerContainer.innerHTML = '';
        habits.forEach(habitData => {
            createAndDisplayHabit(habitData);
        });
    }

    habitForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const habitName = document.getElementById('habitName').value;
        const habitDays = parseInt(document.getElementById('habitDays').value);
        const habitDescription = document.getElementById('habitDescription').value;

        const response = await fetch('/habit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ habit_name: habitName, total_days: habitDays, description: habitDescription })
        });

        if (response.ok) {
            const habitData = await response.json();
            createAndDisplayHabit(habitData);
            document.getElementById('habitForm').reset();
        }
    });

    function createAndDisplayHabit(habitData) {
        const habitTracker = document.createElement('div');
        habitTracker.classList.add('tracker');
    
        // Apply the saved color to the tracker background
        
        habitTracker.innerHTML = `
        <div class ="brush-icon"><img src = "brush.svg"/></div> 
        <h3>${habitData.habit_name}</h3>
        <div class="streak-wrapper">
            <img src="fire.svg" alt="streak-icon" />
            <p id="count"><strong>0</strong></p>
        </div>
        <p>${habitData.description}</p>
        <div class="container"></div>
        `;
    
        trackerContainer.appendChild(habitTracker);
    
        const calendarContainer = habitTracker.querySelector('.container');
        // Pass the saved marked days and day color to the calendar
        let markedDaysArray = JSON.parse(habitData.marked_days) || [];
        createCalendar(calendarContainer, habitData.total_days, habitData.id, markedDaysArray, habitData.day_color || currentDayBoxColor);
    
        // Initialize Pickr color picker for the habit
        const brushIcon = habitTracker.querySelector('.brush-icon');
        const pickr = Pickr.create({
            el: brushIcon,
            theme: 'classic',
            position: 'bottom',
            useAsButton: true,
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    hex: true,
                    rgba: true,
                    hsla: true,
                    input: true,
                    save: true
                }
            }
        });
    
        // Save the selected color and update currentDayBoxColor
        pickr.on('save', (color) => {
            const colorHex = color.toHEXA().toString();
            currentDayBoxColor = colorHex;  // Update the global color variable

            // Re-render the calendar with the current marked days
            createCalendar(calendarContainer, habitData.total_days, habitData.id, markedDaysArray, colorHex);
            updateMarkedDaysOnServer(habitData.id, markedDaysArray, colorHex);
        });
    }

    function createCalendar(container, numDays, habitId, markedDaysArray = [], dayBoxColor = currentDayBoxColor) {
        let markedDays = markedDaysArray.length; // Start with the number of marked days from the database
        const streakCounter = container.parentElement.querySelector('#count');
        
        // Update streak counter based on initial marked days from the database
        streakCounter.textContent = `${markedDays}`;
    
        // Clear existing day boxes if any
        container.innerHTML = '';
    
        // Check for an existing progress bar and remove it
        const existingProgressBar = container.parentElement.querySelector('.progress');
        if (existingProgressBar) {
            existingProgressBar.remove();
        }
    
        // Create a new progress bar
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress');
    
        const progressBarInner = document.createElement('div');
        progressBarInner.classList.add('progress-bar', 'progress-bar-striped', 'progress-bar-animated');
        progressBarInner.setAttribute('role', 'progressbar');
        progressBarInner.style.width = `${Math.round((markedDays / numDays) * 100)}%`; // Set initial progress
        progressBar.appendChild(progressBarInner);
    
        // Append the new progress bar to the container
        container.parentElement.appendChild(progressBar);
    
        // Create day boxes
        for (let i = 1; i <= numDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day');
            dayBox.textContent = i;
    
            // If the day is marked (from the database or locally), apply the marked style
            if (markedDaysArray.includes(i)) {
                dayBox.classList.add('x-marked');
                dayBox.textContent = 'X';
                dayBox.style.backgroundColor = dayBoxColor; // Set the color for marked days
            }
    
            // Event listener for marking/unmarking a day with an 'X'
            dayBox.addEventListener('click', function () {
                this.classList.toggle('x-marked');
    
                if (this.classList.contains('x-marked')) {
                    this.textContent = 'X';
                    this.style.backgroundColor = dayBoxColor; // Use the selected color for marked days
                    if (!markedDaysArray.includes(i)) markedDaysArray.push(i); // Add the day to the marked days array
                } else {
                    this.textContent = i;
                    this.style.backgroundColor = ''; // Revert to default color
                    markedDaysArray = markedDaysArray.filter(day => day !== i); // Remove the day from the array
                }
    
                markedDays = markedDaysArray.length; // Update marked days count
                const progressPercentage = Math.round((markedDays / numDays) * 100);
    
                // Update progress bar and streak counter
                progressBarInner.style.width = `${progressPercentage}%`;
                streakCounter.textContent = `${markedDays}`;
                updateMarkedDaysOnServer(habitId, markedDaysArray, dayBoxColor);
            });
    
            container.appendChild(dayBox);
        }
    }
    
    fetchHabits();
});
