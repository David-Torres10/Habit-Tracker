document.addEventListener('DOMContentLoaded', () => {
    const habitForm = document.getElementById('habitForm');
    const trackerContainer = document.getElementById('trackerContainer');


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
        habitTracker.style.backgroundColor = habitData.color || '#909090'; // Apply saved color from database or default color
    
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
        createCalendar(calendarContainer, habitData.total_days);
    
        // Initialize Pickr color picker on the brush button
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
    
        // Handle Pickr's save event to apply the color
        pickr.on('save', (color) => {
            const colorHex = color.toHEXA().toString();
            // console.log(colorHex);
            habitTracker.style.backgroundColor = colorHex; // Change the background color of the habit tracker
            createCalendar(habitTracker, habitData.numDays, colorHex);
            updateColorOnServer(habitData.id, colorHex); // Save the color to the backend
        });
    }

    function createCalendar(container, numDays, dayBoxColor = '#4bda63') {
        let markedDays = 0;
        const streakCounter = container.parentElement.querySelector('#count');
    
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress');
    
        const progressBarInner = document.createElement('div');
        progressBarInner.classList.add('progress-bar', 'progress-bar-striped', 'progress-bar-animated');
        progressBarInner.setAttribute('role', 'progressbar');
        progressBarInner.style.width = '0%';
        progressBar.appendChild(progressBarInner);
    
        container.parentElement.appendChild(progressBar);
    
        // Create day boxes
        for (let i = 1; i <= numDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day');
            dayBox.textContent = i;
    
            // Event listener for marking a day with an 'X'
            dayBox.addEventListener('click', function () {
                this.classList.toggle('x-marked');
    
                // Change the box color when marked/unmarked
                if (this.classList.contains('x-marked')) {
                    this.textContent = 'X';
                    console.log(dayBoxColor);
                    this.style.backgroundColor = `${dayBoxColor}`; // Use the selected color
                } else {
                    this.textContent = i;
                    this.style.backgroundColor = ''; // Revert to the default color
                }
    
                const isMarked = this.classList.contains('x-marked');
                markedDays += isMarked ? 1 : -1;
    
                const progressPercentage = Math.round((markedDays / numDays) * 100);
                progressBarInner.style.width = progressPercentage + '%';
                streakCounter.textContent = `${markedDays}`;
            });
    
            container.appendChild(dayBox);
        }
    }
    

    fetchHabits();
});