import time
import board
import adafruit_dht
import datetime
import csv

def Device(port):
    return  adafruit_dht.DHT22(port, use_pulseio=False)

def measure(device, path):
    dt_now = datetime.datetime.now().strftime("%Y/%m/%d %H:%M")
    try:
        temperature = Device(device).temperature
        humidity = Device(device).humidity
        discomfort = round(0.81 * temperature + 0.01 * humidity * (0.99 * temperature - 14.3) + 46.3, 1)
        result = [dt_now, temperature, humidity, discomfort]

        print(result)

        print(temperature)

        with open(path, 'a') as file:
            writer = csv.writer(file)
            writer.writerow(result)

    except RuntimeError as error:
        time.sleep(0.1)
        measure(device, path)
        print(error.args[0])
    except Exception as error:
        Device(device).exit()

measure(board.D4, "./log1.csv")
measure(board.D18, "./log2.csv")