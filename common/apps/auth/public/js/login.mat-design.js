function get_cookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

var redirect_to = get_cookie('wiziq_origin');

$('button').on('click', function () {
	var id = $('input#user_id').val();
	var display_name = $('input#display_name').val();

	var identity = {
		id : id,
		displayName : display_name
	};

	var id_string = JSON.stringify(identity);
	var id_uriencoded = encodeURIComponent(id_string);

	document.cookie = "wiziq_auth=" + id_uriencoded + "; max-age=7200; path=/";

	window.location = decodeURIComponent(redirect_to);

	return false;
});
