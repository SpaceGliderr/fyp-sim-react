import json


def generate_performance_report():
    robot_count = [2, 3, 4]

    prefixes = ["M1-S-", "M2-M-", "M3-L-"]
    suffix_lengths = [5, 2, 1]

    for idx, prefix in enumerate(prefixes):
        suffix_length = suffix_lengths[idx]

        robot_log = {}

        for i in range(0, robot_count[idx]):
            robot_log[i] = {
                "goals_reached": 0,
                "goals_expired": 0,
                "goals_exceeded_iter": 0,
                "goals_filtered": 0,
                "time_taken": 0
            }


        for i in range(0, suffix_length):
            suffix = str(i + 1)

            with open(f"./navigation/{prefix}{suffix}.json", "r") as f:
                data = json.load(f)

                for i in range(0, robot_count[idx]):
                    robot = data[str(i)]
                    for activity in robot:
                        if activity.__contains__("time_taken"):
                            robot_log[i]["goals_reached"] += 1
                            robot_log[i]["time_taken"] += abs(activity["time_taken"])
                        elif activity["expired"] == True:
                            robot_log[i]["goals_expired"] += 1
                        elif activity["max_iterations"] == True:
                            robot_log[i]["goals_exceeded_iter"] += 1
                        elif activity["expired"] == False and activity["max_iterations"] == False:
                            robot_log[i]["goals_filtered"] += 1

        total_goals = 0
        total_goals_reached = 0
        total_goals_expired = 0
        total_goals_exceeded_iter = 0
        total_goals_filtered = 0
        total_time_taken = 0

        print(f'Map {idx}')
        for idx, _ in enumerate(robot_log):
            print("\nRobot " + str(idx) + ":")
            print("Goals reached: " + str(robot_log[idx]["goals_reached"]))
            print("Goals expired: " + str(robot_log[idx]["goals_expired"]))
            print("Goals exceeded iterations: " + str(robot_log[idx]["goals_exceeded_iter"]))
            print("Goals filtered: " + str(robot_log[idx]["goals_filtered"]))
            print("Time taken: " + str(robot_log[idx]["time_taken"]))
            if robot_log[idx]["goals_reached"] > 0:
                print("Average time taken: " + str(robot_log[idx]["time_taken"] / robot_log[idx]["goals_reached"]))

            total_goals_reached += robot_log[idx]["goals_reached"]
            total_goals_expired += robot_log[idx]["goals_expired"]
            total_goals_exceeded_iter += robot_log[idx]["goals_exceeded_iter"]
            total_goals_filtered += robot_log[idx]["goals_filtered"]
            total_time_taken += robot_log[idx]["time_taken"]
            total_goals = total_goals + robot_log[idx]["goals_reached"] + robot_log[idx]["goals_expired"] + robot_log[idx]["goals_exceeded_iter"] + robot_log[idx]["goals_filtered"]

        print("\nTotal goals: " + str(total_goals))
        print("Total goals reached: " + str(total_goals_reached))
        print("Total goals expired: " + str(total_goals_expired))
        print("Total goals exceeded iterations: " + str(total_goals_exceeded_iter))
        print("Total goals filtered: " + str(total_goals_filtered))
        print("Total time taken: " + str(total_time_taken))
        if total_goals_reached > 0:
            print("Average time taken: " + str(total_time_taken / total_goals_reached))

        print("\n")


if __name__ == "__main__":
    generate_performance_report()
