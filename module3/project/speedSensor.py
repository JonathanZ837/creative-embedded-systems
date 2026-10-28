import asyncio
import time

from bleak import BleakClient, BleakScanner
from gpiozero import DistanceSensor

distanceSensor2 = DistanceSensor(echo=24, trigger=23, max_distance=4)  # the one on the pi

DEVICE_NAME = "ESP32_Sensor"
CHAR_UUID = "a7c2e1f1-3b4d-4e8a-9c1f-2d5e6f708192"

state = "IDLE" # states are IDLE or PASSED
passThreshold = 10 # distance threshold that registers as a pass
distance = 3 # the fixed distance between two sensors
timeout = 10 # seconds to wait for sensor 2 before resetting
startTime = 0 # when sensor 1 was passed
wasBlocked = False # was sensor 1 blocked on the last reading?

def on_notify(_sender, data: bytearray):
    global state, startTime, wasBlocked
    distance1 = float(data.decode().strip())
    blocked = 0 < distance1 <= passThreshold   # -1 means no echo
    if state == "IDLE" and blocked and not wasBlocked:
        state = "PASSED"
        startTime = time.monotonic()
        print("Sensor 1 passed, timing...")
    wasBlocked = blocked

async def main():
    global state
    device = await BleakScanner.find_device_by_name(DEVICE_NAME, timeout=10)

    if device is None:
        print("esp32 not found")
        return

    while True:
        async with BleakClient(device) as client:
            await client.start_notify(CHAR_UUID, on_notify)
            print("Connected")
            while client.is_connected:
                if state == "PASSED":
                    distance2 = distanceSensor2.distance * 100
                    if distance2 <= passThreshold:
                        timeElapsed = time.monotonic() - startTime
                        speed = distance / timeElapsed
                        print(speed)
                        while distanceSensor2.distance * 100 <= passThreshold:
                            await asyncio.sleep(0.05)
                        state = "IDLE"
                    elif timeElapsed > timeout:
                        print("Timed out")
                        state = "IDLE"
                await asyncio.sleep(0.01)   # lets BLE notifications come in
        print("Disconnected, reconnecting...")
        state = "IDLE"

asyncio.run(main())