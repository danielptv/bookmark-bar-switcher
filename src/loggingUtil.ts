const loggingEnabled = true;

/**
 * Function to log parameterized messages to console when logging is enabled.
 *
 * @param msg The message. "{}" will be replaced with the corresponding parameters if there are any.
 * @param params Variable number of string parameters.
 */
export function debug(msg: string, ...params: string[]): void {
    if (loggingEnabled) {
        if (params) {
            let count = 0;
            let paramMsg = "";
            for (let i = 0; i < msg.length; ++i) {
                if (msg[i] === "{" && msg[i + 1] === "}") {
                    paramMsg += params[count] ? params[count] : "";
                    count++;
                    continue;
                }
                if (msg[i] === "}" && msg[i - 1] === "{") {
                    continue;
                }
                paramMsg += msg[i];
            }
            console.log(paramMsg);
            return;
        }
        console.log(msg);
    }
}

