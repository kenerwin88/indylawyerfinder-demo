
// requires moment.js, handlebars, and jquery to be already loaded

function indyCustomRssLoader(url,callback) {
	$.ajax({
			url: url,
			dataType: 'xml',
			success: function(data) {
			callback(data);
		}
	});
}

$(document).ready(function () {

	$('.indyCustomRssLoader').each(function(index,thisElement){
		var rsslink = $(thisElement).data('rsslink');
		var source = $(thisElement).html().trim();
		var template = Handlebars.compile(source);
		indyCustomRssLoader(rsslink,function (data) {
			var items = mcConvertRSSToJSON(data);
			items.forEach(function(thisItem){
				thisItem.pubdate = moment(thisItem.pubdate).format("MMMM D, YYYY");
				thisItem.link = thisItem.link.replace("http:", "");
			});
			var tenokare;
			$(thisElement).html(template(items));
			$(thisElement).show();
		});
	});
});