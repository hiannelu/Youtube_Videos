let channelId = 'UCMUnInmOkrWN4gof9KlhNmQ';
let lastPg = false;
let regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
let convert = (time) => {
	let arr = time.match(regex);
	if(arr[1] !== undefined) return arr[1]+':'+arr[2]+':'+arr[3];
	else return arr[2]+':'+arr[3];
}
let arrPg = ['CAwQAQ','CAwQAA', 'CBgQAA', 'CCQQAA', 'CDAQAA', 'CDwQAA', 'CEgQAA', 'CFQQAA', 'CGAQAA'];
let currentPg = 0;

$(document).ready(function() {
	$.get(
		"https://www.googleapis.com/youtube/v3/channels", {
			part: 'contentDetails',
			id: 'UCMUnInmOkrWN4gof9KlhNmQ',
			key: 'AIzaSyCzAL1xY0dm3aKQIkiYdbpT-QXytuXR3qI'},
			function(data) {
				$.each(data.items, function(i, item) {
					pid = item.contentDetails.relatedPlaylists.uploads;
					getVids(pid, currentPg);
				})
			}
	);
	
	function getVids(pid, currentPg) {
		$.get(
		"https://www.googleapis.com/youtube/v3/playlistItems", {
			part: 'snippet',
			maxResults: 12,
			playlistId: pid,
			pageToken: arrPg[currentPg],
			key: 'AIzaSyCzAL1xY0dm3aKQIkiYdbpT-QXytuXR3qI'},
			function(data) {
				$.each(data.items, function(i, item) {
					videoTitle = item.snippet.title;
					videoId = item.snippet.resourceId.videoId;
					thumbnails = item.snippet.thumbnails.medium.url;
					getVidsLen(videoId, videoTitle, i, currentPg, thumbnails);
				})
			}
		);
	}
	
	function getVidsLen(videoId, videoTitle, index, currentPg, thumbnails) {
		$.get(
		"https://www.googleapis.com/youtube/v3/videos", {
			part: 'contentDetails',
			id: videoId,
			key: 'AIzaSyCzAL1xY0dm3aKQIkiYdbpT-QXytuXR3qI'},
			function(data) {
				var output;
				$.each(data.items, function(i, item) {
					videoLength = convert(item.contentDetails.duration);
					output = `<td class="container">
					<input type="image" id="${videoId}" width="320" height="180" src="${thumbnails}">
					<div class="video-length">${videoLength}</div>
					${videoTitle}
					</td>`

					var result = `#td${index}`;

					if (currentPg === 0 && index === 0) {
						$(result).html(`
						<div><input type="image" id="test-video" width="320" height="180" src="screenshot.jpg" /><div>
						<div class="video-length">3:30</div>
						<div>測試影片</div>`)
					} else if (currentPg === 8 && index > 3) {
						$(result).html('');
					} else $(result).html(output);
					
					$('#test-video').on('click', function(e) {
						location.href = "test.html";
					})
					var vid = `#${videoId}`;
					$(vid).on('click', function(e) {
						location.href = "redirect.html?"+videoId;
					})
				})
			}
		);
	}

	
	$('.next').on('click', function(e) {
	   currentPg += 1;
	   if (arrPg[currentPg] === undefined) currentPg -= 1;
	   getVids(pid, currentPg);
	}); 
  
    $('.prev').on('click', function(e) {
		currentPg -= 1;
		getVids(pid, currentPg);
	});
	
	$('.page-numbers').on('click', function(e) {
		currentPg = $(this).text() - 1;
		getVids(pid, currentPg);
	})



	let cookieValue = document.cookie;
	let arr = cookieValue.replace(/=/g, '').split(';');


	$.each(arr, function(i, item) {
		let str = item.replace(/\s/g, '');
		if (str === 'testVideo') {
			displayTestVid =
				`<td class="container">
					<input id="saved-test-video" type="image" width="320" height="180" src="thumbnail.png">
						<div class="video-length"></div>
						<br><br><div class="test-title">測試影片</div></td>`


						$('#saved-videos').after(displayTestVid);

						$('#saved-test-video').on('click', function(e) {
							location.href = "test.html";
						})
		}
		getSavedThumb(str);
	})



	function getSavedThumb(savedVid) {
		$.get(
			"https://www.googleapis.com/youtube/v3/videos", {
				part: 'snippet, contentDetails',
				id: savedVid,
				key: 'AIzaSyCzAL1xY0dm3aKQIkiYdbpT-QXytuXR3qI'},
				function(data) {
					var display;
					$.each(data.items, function(i, item) {
						videoTitle = item.snippet.title;
						thumbnails = item.snippet.thumbnails.medium.url;
						videoLength = convert(item.contentDetails.duration);

						display += 
						`<td class="container">
						<input type="image" id="saved-${savedVid}" width="320" height="180" src="${thumbnails}">
						<div class="video-length">${videoLength}</div>
						${videoTitle}
						</td>`

						$('#saved-videos').after(display);

						var vid = `#saved-${savedVid}`;
						$(vid).on('click', function(e) {
							location.href = "redirect.html?"+savedVid;
						})

					})
				}
		);
	}
	

});

