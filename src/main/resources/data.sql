-- Insert initial data into Actors table
MERGE INTO Actors (id, firstName, lastName, nationality, birthDate) VALUES
(1, 'Robert', 'Downey Jr.', 'American', '1965-04-04'),
(2, 'Chris', 'Evans', 'American', '1981-06-13'),
(3, 'Scarlett', 'Johansson', 'American', '1984-11-22');

-- Insert initial data into Directors table
MERGE INTO Directors (id, firstName, lastName, nationality, birthDate) VALUES
(1, 'Jon', 'Favreau', 'American', '1966-10-19'),
(2, 'Joss', 'Whedon', 'American', '1964-06-23');

-- Insert initial data into Movies table
MERGE INTO Movies (id, title, synopsis, duration, genre) VALUES
(1, 'Iron Man', 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.', 126, 1),
(2, 'The Avengers', 'Earth\s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.', 143, 1);

-- Insert initial data into MovieActors table
MERGE INTO MovieActors (movieId, actorId) VALUES
(1, 1), -- Robert Downey Jr. in Iron Man
(2, 1), -- Robert Downey Jr. in The Avengers
(2, 2), -- Chris Evans in The Avengers
(2, 3); -- Scarlett Johansson in The Avengers

-- Insert initial data into MovieDirectors table
MERGE INTO MovieDirectors (movieId, directorId) VALUES
(1, 1), -- Jon Favreau directed Iron Man
(2, 2); -- Joss Whedon directed The Avengers