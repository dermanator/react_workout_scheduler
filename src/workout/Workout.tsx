interface WorkoutDuration {
  duration: number;
  maxTimes: number;
}

interface WorkoutType {
  type: string;
  durations: WorkoutDuration[];
}

interface Workout {
  type: string;
  duration: number;
}

interface DaySchedule {
  day: string;
  workouts: Workout[];
}

const workoutTypes: WorkoutType[] = [
  {
    type: "Lower Body",
    durations: [
      { duration: 10, maxTimes: 2 },
      { duration: 20, maxTimes: 2 },
      { duration: 30, maxTimes: 1 },
    ],
  },
  {
    type: "Upper Body",
    durations: [
      { duration: 10, maxTimes: 2 },
      { duration: 20, maxTimes: 2 },
      { duration: 30, maxTimes: 1 },
    ],
  },
  {
    type: "Total Body",
    durations: [
      { duration: 10, maxTimes: 2 },
      { duration: 20, maxTimes: 2 },
      { duration: 30, maxTimes: 1 },
    ],
  },
  {
    type: "Core",
    durations: [
      { duration: 10, maxTimes: 2 },
      { duration: 20, maxTimes: 2 },
      { duration: 30, maxTimes: 1 },
    ],
  },
  {
    type: "HIIT",
    durations: [
      { duration: 10, maxTimes: 2 },
      { duration: 20, maxTimes: 2 },
      { duration: 30, maxTimes: 1 },
    ],
  },
  {
    type: "Kick Boxing",
    durations: [
      { duration: 10, maxTimes: 2 },
      { duration: 20, maxTimes: 2 },
      { duration: 30, maxTimes: 1 },
    ],
  },
  {
    type: "Yoga",
    durations: [{ duration: 30, maxTimes: 1 }],
  },
  {
    type: "Outdoor Running",
    durations: [{ duration: 30, maxTimes: 1 }],
  },
];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function removeFromArray<T>(array: T[], index: number) {
  const item = array[index];
  const newArray = [...array.slice(0, index), ...array.slice(index + 1)];
  return { item, newArray };
}

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getScheduleForDay(
  day: DaySchedule,
  workouts: Workout[],
  week: DaySchedule[]
): { day: DaySchedule; workouts: Workout[] } {
  const currentDayTotal = day.workouts.reduce(
    (total, workout) => total + workout.duration,
    0
  );

  //  If the day is full, return it
  if (currentDayTotal >= 30) {
    return { day, workouts };
  }

  //  Randomly choose a new workout from the list
  let nextWorkout: Workout | null = null;
  let randomIndex = 0;
  let found = false;
  let loopCount = 0;

  while (!found && loopCount++ < 1000) {
    if (loopCount > 18) {
      console.log({ nextWorkout, loopCount, randomIndex, week });
    }

    found = false;
    randomIndex = randomIntFromInterval(0, workouts.length - 1);
    nextWorkout = workouts[randomIndex];

    //  If the new workout type already exists for the day, don't use it and try again
    if (day.workouts.findIndex((w) => w.type === nextWorkout?.type) > -1)
      continue;

    //  If the new workout duration causes the schedule to exceed 30 minutes try again
    if (currentDayTotal + (nextWorkout?.duration ?? 0) > 30) continue;

    //  Make sure we don't overschedule the same type across the entire week
    const weekTypeTotal = week.reduce(
      (total, iterDay) =>
        total +
        (iterDay.workouts.find((w) => w.type === nextWorkout?.type)?.duration ||
          0),
      0
    );
    if (weekTypeTotal >= 30) continue;

    found = true;
  }

  //  Return the new schedule for the day with the workout added
  //  to the day and removed from the workout list
  return getScheduleForDay(
    {
      ...day,
      workouts: [...day.workouts, nextWorkout || { type: "", duration: 0 }],
    },
    removeFromArray(workouts, randomIndex).newArray,
    week
  );
}

function expandWorkoutTypes(workoutTypes: WorkoutType[]) {
  const res = workoutTypes.reduce<Workout[]>(
    (flattenedWorkouts, workoutType) => {
      return [
        ...flattenedWorkouts,
        ...workoutType.durations
          .map((duration) =>
            [...Array(duration.maxTimes).keys()].map(() => ({
              type: workoutType.type,
              duration: duration.duration,
            }))
          )
          .flat(),
      ];
    },
    []
  );

  return res;
}

export function Workout() {
  const sortedWorkoutTypes = workoutTypes.sort(
    (wt1, wt2) =>
      wt1.durations.reduce((total, d) => d.duration * d.maxTimes + total, 0) -
      wt2.durations.reduce((total, d) => d.duration * d.maxTimes + total, 0)
  );

  let workouts = expandWorkoutTypes(workoutTypes);
  const schedule = days.reduce<DaySchedule[]>((week, day) => {
    const updated = getScheduleForDay({ day, workouts: [] }, workouts, week);
    workouts = updated.workouts;
    return [...week, updated.day];
  }, []);

  const totals = workoutTypes.map((workoutType) => ({
    type: workoutType.type,
    total: schedule.reduce(
      (total, day) =>
        total +
        (day.workouts.find((w) => w.type === workoutType.type)?.duration || 0),
      0
    ),
  }));

  console.log({ totals });

  return (
    <table>
      <tbody>
        <tr>
          <td
            style={{ width: "300px", textAlign: "left", verticalAlign: "top" }}
          >
            <pre>{JSON.stringify(schedule, null, 2)}</pre>
          </td>
          <td
            style={{ width: "300px", textAlign: "left", verticalAlign: "top" }}
          >
            <pre>{JSON.stringify(totals, null, 2)}</pre>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
