import snowboydecoder
import sys
import signal
print("running python file now.")

# Demo code for listening two hotwords at the same time

interrupted = False


def signal_handler(signal, frame):
    global interrupted
    interrupted = True


def interrupt_callback():
    global interrupted
    return interrupted

def wakeup():
    print("wakeup")

def sleep():
    print("sleep")

def news():
    print("news")

def radio():
    print("radio")

def todo():
    print("todo")

def uber():
    print("uber")

def cancel():
    print("cancel")

modelpath = "/home/pi/Public/Mirror/rpi-arm-raspbian-8.0-1.2.0/resources/"

models = [modelpath + "wakeup.pmdl", modelpath + "sleep.pmdl",
          modelpath + "news.pmdl", modelpath + "radio.pmdl",
          modelpath + "todo.pmdl", modelpath + "uber.pmdl",
          modelpath + "cancel.pmdl"]

# capture SIGINT signal, e.g., Ctrl+C
signal.signal(signal.SIGINT, signal_handler)

sensitivity = [0.5]*len(models)
detector = snowboydecoder.HotwordDetector(models, sensitivity=sensitivity)
callbacks = [wakeup, sleep, news, radio, todo, uber, cancel]
print('Listening from python file.')

# main loop
# make sure you have the same numbers of callbacks and models
detector.start(detected_callback=callbacks,
               interrupt_check=interrupt_callback,
               sleep_time=0.03)

detector.terminate()
