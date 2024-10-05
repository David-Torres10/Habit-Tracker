document.addEventListener('DOMContentLoaded', () => {
    const habitForm = document.getElementById('habitForm');
    const trackerContainer = document.getElementById('trackerContainer');

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
        pickr.on('save', (color, instance) => {
            const colorHex = color.toHEXA().toString();
            habitTracker.style.backgroundColor = colorHex; // Change the background color of the habit tracker
        });
    }
    

    function createCalendar(container, numDays) {
        let markedDays = 0;
        const streakCounter = container.parentElement.querySelector('#count');

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress');

        const progressBarInner = document.createElement('div');
        progressBarInner.classList.add('progress-bar', 'progress-bar-animated', 'progress-bar-striped');
        progressBar.appendChild(progressBarInner);

        container.parentElement.appendChild(progressBar);

        for (let i = 1; i <= numDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day');
            dayBox.textContent = i;

            dayBox.addEventListener('click', function () {
                this.classList.toggle('x-marked');
                this.textContent = this.classList.contains('x-marked') ? 'X' : i;
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
