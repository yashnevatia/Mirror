import snowboydecoder
import sys
import signal


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

# def news():
#     print("news")

def radio():
    print("radio")

def todo():
    print("reminders")

def uber():
    print("uber")

def cancel():
    print("cancel")

def outfits():
    print("outfits")

def picture():
    print("picture")

def reminders():
    print("reminders")

def uber():
    print("uber")

def stories():
    print("uber")

def lights():
    print("uber")


modelpath = "/home/pi/Public/Mirror/rpi-arm-raspbian-8.0-1.2.0/resources/amanda2/"

models = [ modelpath + "wakeup.pmdl", modelpath + "sleep.pmdl",
          modelpath + "cancel.pmdl",
          # modelpath + "news.pmdl",
          modelpath + "reminders.pmdl",
          modelpath + "uber.pmdl", modelpath + "outfits.pmdl",
          modelpath + "picture.pmdl",
          modelpath + "lights.pmdl", modelpath + "stories.pmdl" ]

# capture SIGINT signal, e.g., Ctrl+C
signal.signal(signal.SIGINT, signal_handler)

sensitivity = [0.5]*len(models)
detector = snowboydecoder.HotwordDetector(models, sensitivity=sensitivity)

# callbacks = [wakeup, sleep, cancel, news, reminders, uber, outfits, picture]
callbacks = [wakeup, sleep, cancel, reminders, uber, outfits, picture, lights, stories]


# main loop
# make sure you have the same numbers of callbacks and models
detector.start(detected_callback=callbacks,
               interrupt_check=interrupt_callback,
               sleep_time=0.03)

detector.terminate()
