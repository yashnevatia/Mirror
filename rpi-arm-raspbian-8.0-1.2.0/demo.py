import snowboydecoder
import sys
import signal

interrupted = False


def signal_handler(signal, frame):
    global interrupted
    interrupted = True


def interrupt_callback():
    global interrupted
    return interrupted

def mirror():
	print("snowboy")

modelpath = "/Users/amandahansen/Mirror/rpi-arm-raspbian-8.0-1.2.0/resources/snowboy.umdl"
# model = "/home/pi/Public/web-smart-mirror/rpi-arm-raspbian-8.0-1.2.0/resources/snowboy.umdl"

# capture SIGINT signal, e.g., Ctrl+C
signal.signal(signal.SIGINT, signal_handler)

detector = snowboydecoder.HotwordDetector(model, sensitivity=0.5)
print('Listening... Press Ctrl+C to exit')

# main loop
detector.start(detected_callback=mirror,
               interrupt_check=interrupt_callback,
               sleep_time=0.03)

detector.terminate()
