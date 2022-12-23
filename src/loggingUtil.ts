/**
 * @licence Copyright (C) 2022 - present Daniel Purtov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file This section contains a simple logging utility for displaying
 * debug information on console.
 *
 * @author Daniel Purtov
 */

const LOGGING_ENABLED = true;

/**
 * Log parameterized messages to console when logging is enabled.
 *
 * @param msg The message. "{}" will be replaced with the corresponding parameters if there are any.
 * @param params Variable number of string parameters.
 */
export function debug(msg: string, ...params: string[]): void {
  if (LOGGING_ENABLED) {
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
