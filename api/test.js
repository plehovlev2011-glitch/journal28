// api/test.js - простой тест
export default async function handler(req, res) {
  console.log('Test endpoint hit!');
  
  res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
}
