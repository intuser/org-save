interactive("org-save",
    "Save and capture page or link.",
    function (I) {
        var element = yield read_browser_object(I);
        var spec = load_spec(element);
        var panel;
        panel = create_info_panel(I.window, "download-panel",
                                  [["downloading",
                                    element_get_operation_label(element, "Saving"),
                                    load_spec_uri_string(spec)],
                                   ["mime-type", "Mime type:", load_spec_mime_type(spec)]]);
        try {
            var file = yield I.minibuffer.read_file_check_overwrite(
                $prompt = "Save as:",
                $initial_value = suggest_save_path_from_file_name(suggest_file_name(spec), I.buffer),
                $history = "save");
        } finally {
            panel.destroy();
        }
        save_uri(spec, file,
                 $buffer = I.buffer,
                 $use_cache = false);
		var orgtitle = load_spec_title(spec);
		
		orgtitle = orgtitle.replace(/(\r\n|\n|\r)/gm," ");
		orgtitle = orgtitle.replace(/\s+/g, ' ');
        org_capture(encodeURIComponent(file.path), encodeURIComponent(orgtitle), encodeURIComponent(I.buffer.top_frame.getSelection()), I.window);
		// I.window.minibuffer.message('Issuing ' + file.path);
    },
			$browser_object = browser_object_links);

define_key(content_buffer_normal_keymap, "M-S", "org-save");

interactive("org-complete",
    "Save and capture a page and all supporting documents, including images, css,"+
    "and child frame documents.",
    function (I) {
        check_buffer(I.buffer, content_buffer);
        var element = yield read_browser_object(I);
        var spec = load_spec(element);
        var doc;
        if (!(doc = load_spec_document(spec)))
            throw interactive_error("Element is not associated with a document.");
        var suggested_path = suggest_save_path_from_file_name(suggest_file_name(spec), I.buffer);
        var panel = create_info_panel(I.window, "download-panel",
                                      [["downloading",
                                        element_get_operation_label(element, "Saving complete"),
                                        load_spec_uri_string(spec)],
                                       ["mime-type", "Mime type:", load_spec_mime_type(spec)]]);
        try {
            var file = yield I.minibuffer.read_file_check_overwrite(
                $prompt = "Save page complete:",
                $history = "save",
                $initial_value = suggested_path);
            // FIXME: use proper read function
            var dir = yield I.minibuffer.read_file(
                $prompt = "Data Directory:",
                $history = "save",
                $initial_value = file.path + ".support");
        } finally {
            panel.destroy();
        }
        save_document_complete(doc, file, dir, $buffer = I.buffer);
		var orgtitle = load_spec_title(spec);
		orgtitle = orgtitle.replace(/(\r\n|\n|\r)/gm," ");
		orgtitle = orgtitle.replace(/\s+/g, ' ');
        org_capture(encodeURIComponent(file.path), orgtitle, encodeURIComponent(I.buffer.top_frame.getSelection()), I.window);
    },
    $browser_object = browser_object_frames);

define_key(content_buffer_normal_keymap, "M-C", "org-complete");
