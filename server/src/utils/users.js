const users = [];

const addUser = ({socketId, username, room}) => {
 
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  
  if(!username || !room) {
    return {
      error: 'Username and room are required',
    };
  }

  
  const existingUser = users.find((user) => user.room === room && user.username === username);
  if(existingUser) {
    return {
      error: 'Username is in use!'
    };
  }

  
  const user = {
    id: socketId,
    username,
    room
  };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter(user => user.room === room);
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};