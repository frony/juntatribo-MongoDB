'use strict';

const nav = [
  { link: '/jukebox', title: 'Music Player' },
  { link: '/jukebox/songList', title: 'Song List' },
  { link: '/jukebox/addSong', title: 'Add Song' },
  { link: '/auth/profile', title: 'User Profile' }, // TODO: create profile router and move it out of auth profile
  { link: '/auth/logout', title: 'Log Out' },
];

module.exports = () => nav;
