import asyncio
import time

from bleak import BleakClient, BleakScanner
from gpiozero import DistanceSensor

import json
import websockets

clients = set()

distanceSensor2 = DistanceSensor(echo=24, trigger=23, max_distance=4)  # the one on the pi

DEVICE_NAME = "ESP32_Sensor"
CHAR_UUID = "a7c2e1f1-3b4d-4e8a-9c1f-2d5e6f708192"

state = "IDLE" # states are IDLE or PASSED
passThreshold = 30 # distance threshold that registers as a pass
distance = 3 # the fixed distance between two sensors
timeout = 10 # seconds to wait for sensor 2 before resetting
startTime = 0 # when sensor 1 was passed
numFootsteps = 0
numBacktracks = 0
lastDistance2 = 0


async def ws_handler(websocket):
    clients.add(websocket)
    print("p5js connected")
    try:
        await websocket.wait_closed()
    finally:
        clients.discard(websocket)

def on_notify(_sender, data: bytearray):
    global state, startTime
    distance1 = float(data.decode().strip())
    if state == "IDLE" and distance1 < passThreshold:
        state = "PASSED"
        startTime = time.monotonic()
        print("Sensor 1 passed, timing...")

async def main():
    global state, numFootsteps, numBacktracks, lastDistance2
    device = await BleakScanner.find_device_by_name(DEVICE_NAME, timeout=10)

    if device is None:
        print("esp32 not found")
        return

    await websockets.serve(ws_handler, "0.0.0.0", 8765)

    while True:
        async with BleakClient(device) as client:
            await client.start_notify(CHAR_UUID, on_notify)
            print("Connected")
            while client.is_connected:
                if state == "PASSED":
                    distance2 = distanceSensor2.distance * 100
                    timeElapsed = time.monotonic() - startTime
                    if lastDistance2 < distance2-0.2:
                        numBacktracks += 1
                    if distance2 < lastDistance2 and distance2 - lastDistance2 > 0.2:
                        numFootsteps += 1
                    lastDistance2 = distance2
                    if distance2 <= passThreshold:
                        speed = distance / timeElapsed
                        print("speed: " + str(speed))
                        print("footsteps: " + str(numFootsteps))
                        print("backtracks: " + str(numBacktracks))
                        websockets.broadcast(clients, json.dumps({"speed": speed, "footsteps": numFootsteps, "backtracks": numBacktracks}))
                        while distanceSensor2.distance * 100 <= passThreshold:
                            await asyncio.sleep(0.05)
                        speed = 0
                        numFootsteps = 0
                        numBacktracks = 0
                        lastDistance2 = 0
                        state = "IDLE"
                    elif timeElapsed > timeout:
                        print("Timed out")
                        speed = 0
                        numFootsteps = 0
                        numBacktracks = 0
                        lastDistance2 = 0
                        state = "IDLE"
                await asyncio.sleep(0.05)
        print("Disconnected, reconnecting...")
        state = "IDLE"

asyncio.run(main())
