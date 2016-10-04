const baseUrl = 'https://bitusppliers.com';

const taskLink = (taskId) => {
  return `${baseUrl}/task/${taskId}`
};

const fileLink = (fileId) => {
  return `${baseUrl}/file/${fileId}`
};

module.exports = {
  taskLink,
  fileLink
};
