import _ from "../../imports/lodash.js"
import { html } from "../../imports/Preact.js"

import { FilePicker } from "../FilePicker.js"
import { PasteHandler } from "../PasteHandler.js"
import { guess_notebook_location } from "../../common/NotebookLocationFromURL.js"

/**
 * @param {{
 *  client: import("../../common/PlutoConnection.js").PlutoConnection?,
 *  connected: Boolean,
 *  show_samples: Boolean,
 *  CustomPicker: {text: String, placeholder: String}?,
 *  on_start_navigation: (string) => void,
 * }} props
 */
export const Open = ({ client, connected, CustomPicker, show_samples, on_start_navigation }) => {
    const on_open_path = async (new_path) => {
        const processed = await guess_notebook_location(new_path)
        if (processed.type === "path") {
            on_start_navigation(processed.path_or_url)
            window.location.href = link_open_path(processed.path_or_url)
        } else {
            if (confirm("Are you sure? This will download and run the file at\n\n" + processed.path_or_url)) {
                on_start_navigation(processed.path_or_url)
                window.location.href = link_open_url(processed.path_or_url)
            }
        }
    }

    const desktop_on_open_path = async (_p) => {
        window.plutoDesktop?.fileSystem.openNotebook("path")
    }

    const desktop_on_open_url = async (url) => {
        window.plutoDesktop?.fileSystem.openNotebook("url", url)
    }

    const picker = CustomPicker ?? {
        text: "Open a notebook",
        placeholder: "Enter path or URL...",
    }

    return html`<${PasteHandler} on_start_navigation=${on_start_navigation} />
        <h2>${picker.text}</h2>
        <div id="new" class=${!!window.plutoDesktop ? "desktop_opener" : ""}>
            <${FilePicker}
                key=${picker.placeholder}
                client=${client}
                value=""
                on_submit=${on_open_path}
                on_desktop_submit=${desktop_on_open_path}
                button_label=${window.plutoDesktop ? "Open File" : "Open"}
                placeholder=${picker.placeholder}
            />
            ${window.plutoDesktop &&
            html`<${FilePicker}
                key=${picker.placeholder}
                client=${client}
                value=""
                on_desktop_submit=${() => {
                    console.log("TODO: implement prompt or input component")
                    desktop_on_open_url(prompt("Enter notebook URL"))
                }}
                button_label="Open from URL"
                placeholder=${picker.placeholder}
            />`}
        </div>`
}

// /open will execute a script from your hard drive, so we include a token in the URL to prevent a mean person from getting a bad file on your computer _using another hypothetical intrusion_, and executing it using Pluto
export const link_open_path = (path) => "open?" + new URLSearchParams({ path: path }).toString()
export const link_open_url = (url) => "open?" + new URLSearchParams({ url: url }).toString()
export const link_edit = (notebook_id) => "edit?id=" + notebook_id
