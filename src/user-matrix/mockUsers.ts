export interface GitHubUser {
  login: string;
  avatar_url: string;
  repos_count: number;
}

export const MOCK_USERS: GitHubUser[] = [
  { login: "mojombo", avatar_url: "https://avatars.githubusercontent.com/u/1?v=4", repos_count: 66 },
  { login: "defunkt", avatar_url: "https://avatars.githubusercontent.com/u/2?v=4", repos_count: 31 },
  { login: "pjhyett", avatar_url: "https://avatars.githubusercontent.com/u/3?v=4", repos_count: 8 },
  { login: "wycats", avatar_url: "https://avatars.githubusercontent.com/u/4?v=4", repos_count: 280 },
  { login: "ezmobius", avatar_url: "https://avatars.githubusercontent.com/u/5?v=4", repos_count: 0 },
  { login: "ivey", avatar_url: "https://avatars.githubusercontent.com/u/6?v=4", repos_count: 55 },
  { login: "evanphx", avatar_url: "https://avatars.githubusercontent.com/u/7?v=4", repos_count: 107 },
  { login: "vanpelt", avatar_url: "https://avatars.githubusercontent.com/u/17?v=4", repos_count: 50 },
  { login: "wayneeseguin", avatar_url: "https://avatars.githubusercontent.com/u/18?v=4", repos_count: 130 },
  { login: "brynary", avatar_url: "https://avatars.githubusercontent.com/u/19?v=4", repos_count: 25 },
  { login: "kevinclark", avatar_url: "https://avatars.githubusercontent.com/u/20?v=4", repos_count: 42 },
  { login: "technoweenie", avatar_url: "https://avatars.githubusercontent.com/u/21?v=4", repos_count: 170 },
  { login: "macournoyer", avatar_url: "https://avatars.githubusercontent.com/u/22?v=4", repos_count: 63 },
  { login: "takeo", avatar_url: "https://avatars.githubusercontent.com/u/23?v=4", repos_count: 5 },
  { login: "caged", avatar_url: "https://avatars.githubusercontent.com/u/25?v=4", repos_count: 88 },
  { login: "topfunky", avatar_url: "https://avatars.githubusercontent.com/u/26?v=4", repos_count: 95 },
  { login: "anotherjesse", avatar_url: "https://avatars.githubusercontent.com/u/27?v=4", repos_count: 72 },
  { login: "roland", avatar_url: "https://avatars.githubusercontent.com/u/28?v=4", repos_count: 12 },
  { login: "lukas", avatar_url: "https://avatars.githubusercontent.com/u/29?v=4", repos_count: 38 },
  { login: "fanvsfan", avatar_url: "https://avatars.githubusercontent.com/u/30?v=4", repos_count: 3 },
];
