/**
 * User Matrix (from Retell AI recruiter)
 *
 * Build a component that fetches GitHub users, gets each user's repo count,
 * and displays 9 of them in a 3x3 grid with random placement.
 *
 * API: GET https://api.github.com/users (returns ~30 users)
 * Each user object has: login, avatar_url, repos_url
 * Fetching repos_url returns an array of repos (use .length for count).
 *
 * Requirements:
 * 1. Fetch users from the GitHub API on mount.
 * 2. For each user, fetch their repo count from their repos_url.
 * 3. Randomly select 9 users and display them in a 3x3 grid.
 * 4. Each cell shows: avatar, username, and repo count.
 * 5. Show a loading state while data is being fetched.
 * 6. Show an error state if any fetch fails.
 */

import { useEffect, useState } from "react";

import { MOCK_USERS, type GitHubUser } from "./mockUsers";
import styles from "./UserMatrix.module.css";

const GRID_SIZE = 9;

const fetchMockData = (
  shouldError?: boolean,
): Promise<{ json: () => Promise<GitHubUser[]> }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldError) {
        reject("Error with fetch.");
      } else {
        resolve({
          json: () => Promise.resolve(MOCK_USERS),
        });
      }
    }, 1000);
  });
};

const selectRandomUsers = (users: GitHubUser[], count: number) => {
  const indices = new Set<number>();
  const limit = Math.min(count, users.length);

  while (indices.size < limit) {
    indices.add(Math.floor(Math.random() * users.length));
  }

  return [...indices].map((index) => users[index]);
};

export const UserMatrix = () => {
  const [fetchState, setFetchState] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [userData, setUserData] = useState<GitHubUser[]>([]);

  useEffect(() => {
    fetchMockData()
      .then((response) => response.json())
      .then((data) => {
        setFetchState("success");
        setUserData(selectRandomUsers(data, GRID_SIZE));
      })
      .catch(() => {
        setFetchState("error");
      });
  }, []);

  if (fetchState === "loading") {
    return <p>Loading github users...</p>;
  }

  if (fetchState === "error") {
    return <p>There was an issue fetching github users.</p>;
  }

  return (
    <div className={styles.container}>
      <h2>User Matrix</h2>
      <div className={styles.grid}>
        {userData.map((user) => (
          <div key={user.login} className={styles.cell}>
            <img
              className={styles.avatar}
              src={user.avatar_url}
              alt={`${user.login} avatar`}
            />
            <p className={styles.login}>{user.login}</p>
            <p className={styles.repoCount}>Repo count: {user.repos_count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
