/**
 * Custom blocks
 */
//% color=#00bc11 icon="\uf1eb" weight=90 block="MotoduinoIoT"
namespace MotoduinoWiFi {

    let bAP_Connected: boolean = false
    let bThingSpeak_onnected: boolean = false

	// write AT command with CR+LF ending
    function sendAT(command: string, wait: number = 0) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }
	
    // wait for certain response from ESP8266
    function waitResponse(): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
        while (true) {
            serial_str += serial.readString()
            if (serial_str.length > 200)
                serial_str = serial_str.substr(serial_str.length - 200)
            if (serial_str.includes("OK") || serial_str.includes("ALREADY CONNECTED") || serial_str.includes("WIFI GOT IP") || serial_str.includes("CONNECT")) {
                result = true
                break
            }
            if (serial_str.includes("ERROR") || serial_str.includes("FAIL")) {
                break
            }
            if (input.runningTime() - time > 5000) {
                break
            }
        }
        return result
    }

    /**
      * Set Motoduino WIFI Terminal 
      * @param txd Iot module to micro:bit ; eg: SerialPin.P15
      * @param rxd micro:bit to Iot module ; eg: SerialPin.P8
      */
    //% blockId=Wifi_Setup
    //% weight=100
    //% block="Motoduino WIFI Set| TXD %txd| RXD %rxd| SSID %ssid| PASSWORD %passwd"

    export function Wifi_Setup(txd: SerialPin, rxd: SerialPin, ssid: string, passwd: string): void {
        serial.redirect(
            txd,   //TX
            rxd,  //RX
            9600
        );
		
        /**
		serial.setRxBufferSize(128)
        serial.setTxBufferSize(128)
        control.waitMicros(500000)
        WifiDataReceived()
        control.waitMicros(200000)
        serial.writeLine("AT+Restart=");
        control.waitMicros(1300000)
        serial.writeLine("AT+AP_SET?ssid=" + ssid + "&pwd=" + passwd + "&AP=" + ap + "=");
        for (let id_y = 0; id_y <= 4; id_y++) {
            for (let id_x = 0; id_x <= 4; id_x++) {
                if (!IOT_WIFI_CONNECTED) {
                    led.plot(id_x, id_y)
                    basic.pause(500)

                }

            }
        }
        **/

        sendAT("AT+RESTORE", 1000) // restore to factory settings
        sendAT("AT+CWMODE_CUR=1") // set to STA mode
        sendAT("AT+RST", 1000) // reset
        basic.pause(100)

        bAP_Connected = false
        bThingSpeak_onnected = false
        sendAT("AT+CWJAP_CUR=\"" + ssid + "\",\"" + passwd + "\"", 0) // connect to Wifi router
        bAP_Connected = waitResponse()
        basic.pause(100)
    }


    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% blockId=Check_WiFiConnect
    //% weight=85
    //% block="Check WiFiConnect"
    export function Check_WiFiConnect(): boolean {
        return bAP_Connected
    }
}
