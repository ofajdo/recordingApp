import time
import board
import adafruit_dht
import datetime
import csv
import numpy as np

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

        return([temperature, humidity, discomfort])
    except RuntimeError as error:
        time.sleep(0.1)
        measure(device, path)
        print(error.args[0])
    except Exception as error:
        Device(device).exit()

def diff(value1, value2, path):
    dt_now = datetime.datetime.now().strftime("%Y/%m/%d %H:%M")
    array1 = np.array(value1)
    array2 = np.array(value2)

    array = array2 - array1
    array = np.round(array, decimals=1)
    array = np.append(dt_now, array)

    print(array)

    with open(path, 'a') as file:
        writer = csv.writer(file)
        writer.writerow(array)

diff(measure(board.D4, "./log1.csv"),measure(board.D18, "./log2.csv"),"./diff.csv")