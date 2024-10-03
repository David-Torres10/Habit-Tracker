const form = document.getElementById('habitForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get user inputs
        const habitName = document.getElementById('habitName').value;
        const habitDays = document.getElementById('habitDays').value;
        const habitDescription = document.getElementById('habitDescription').value;

        // Create a new card for the habit
        const newHabit = document.createElement('div');
        newHabit.classList.add('card', 'mb-3');
        newHabit.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${habitName} - ${habitDays} Days</h5>
                <p class="card-text">${habitDescription}</p>
            </div>
        `;

        // Append the new habit card to the tracker wrapper
        document.querySelector('.tracker-wrapper').appendChild(newHabit);

        // Close the modal
        const habitModal = new bootstrap.Modal(document.getElementById('habitModal'));
        habitModal.hide();

        // Clear form after submission
        form.reset();
    });
