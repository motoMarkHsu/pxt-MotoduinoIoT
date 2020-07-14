/**
 * Custom blocks
 */
//% color=#00bc11 icon="\uf1eb" weight=90 block="MotoduinoIoT"
namespace MotoduinoWiFi {

    let bAP_Connected: boolean = false
    let bThingSpeak_Connected: boolean = false

    // write AT command with CR+LF ending
    function sendAT(command: string, wait: number = 1000) {
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
            if (input.runningTime() - time > 3000) {
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
    //% block="Motoduino WIFI Set| Tx Pin %txd| Rx Pin %rxd| SSID %ssid| PASSWORD %passwd"

    export function Wifi_Setup(txd: SerialPin, rxd: SerialPin, ssid: string, passwd: string): void {
        /**
        serial.redirect(
            txd,   //TX
            rxd,  //RX
            BaudRate.BaudRate9600
        )

        sendAT("AT+RESTORE", 1000) // restore to factory settings
        sendAT("AT+CWMODE=1") // set to STA mode
        sendAT("AT+RST", 1000) // reset
        basic.pause(100)

        bAP_Connected = false
        bThingSpeak_Connected = false
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + passwd + "\"", 0) // connect to Wifi router
        bAP_Connected = waitResponse()
        basic.pause(100)
        **/
		
        serial.redirect(txd, rxd, BaudRate.BaudRate9600)
        bAP_Connected = false
        bThingSpeak_Connected = false
		
        serial.writeString("AT+RST" + "\u000D" + "\u000A")
    	basic.pause(1000)
    	serial.writeString("AT+CWMODE_CUR=1" + "\u000D" + "\u000A")
    	basic.pause(1000)
    	let printT = "AT+CWJAP_CUR=\"" + ssid + "\",\"" + passwd + "\""
    	serial.writeString(printT + "\u000D" + "\u000A")
		basic.pause(1000)
        bAP_Connected = waitResponse()
    	basic.pause(4000)
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
