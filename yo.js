const spawn = require('child_process').spawn;

py = spawn('python', ['-u', '/home/pi/test_image.py'],{
    stdio: ['pipe', 'pipe', 'ignore'],
    cwd: '/home/pi'
  });
