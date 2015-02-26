var consumerKey = '9994e3c432c77379bee441c98b1a4082';
var host = 'https://api.soundcloud.com';
var magnitude = 0.10;
var container = $('.wrapper');
var track, SC;
var playingElements = $('.progress-bar, .controls, .comments-progress');

function setTimeline(data) {
  $('.track-title').html(data.user.username + ' &mdash; "' + data.title + '"');
  $('.comments-list').css('height', Math.round(data.duration * magnitude));
  $('.comments-list .comment').remove();
  $.get(host + '/tracks/' + data.id + '/comments?consumer_key=' + consumerKey, function(data) {
    data.sort(function(a,b) { return parseFloat(a.timestamp) - parseFloat(b.timestamp); } );
    var lastCommentTop = 0;
    var lastHeight;
    for (var i = 0; i < data.length; i++) {
      var thisTop = Math.round(data[i].timestamp * magnitude);
      if (thisTop < lastCommentTop + lastHeight) {
        thisTop = lastCommentTop + lastHeight;
      }
      var userAvatar = data[i].user.avatar_url;
      userAvatar = userAvatar.replace('-large.jpg', '-badge.jpg');
      $('.comments-list').append('<div id="comment-' + data[i].id + '" class="comment" style="top: ' + thisTop + 'px;"><img class="avatar" src="' + userAvatar + '"><span class="comment-text">' + data[i].user.username + ': ' + data[i].body + '</span></div>');
      lastHeight = $('.comments-list .comment').last().outerHeight();
      lastCommentTop = thisTop;
    }
  });
}

function updateProgress(givenposition) {
  var newposition;
  if (givenposition >= 0) {
    newposition = givenposition;
  } else {
    newposition = track.position;
  }

  $('.bar-progress').css('width', newposition / track.durationEstimate * 100 + '%');
  $('.comments-progress').css('top', Math.round(newposition  * magnitude) + 'px');

  var progressTop = $('.comments-progress').position().top;
  var windowYCenter = $(window).height() / 2;
  var diffY = progressTop - windowYCenter;

  if (Math.abs(diffY) >= 0) {
    container.animate({
      scrollTop: diffY
    }, 0);
  }
}

function setPosition(newposition) {
  track.setPosition(newposition);
  updateProgress(newposition);
}

function setArtwork(data) {
  if (data.artwork_url) {
    var tempArtwork = data.artwork_url;
    tempArtwork = tempArtwork.replace('-large.jpg', '-t500x500.jpg');
    $('.image-bg-wrap').css('background-image', 'url(' + tempArtwork + ')');
  }
}

function loadTrack(trackID, isHistory) {

  if (track) {
    track.destruct();
  }

  SC.initialize({
    client_id: consumerKey
  });

  $('.search-wrap').toggleClass('hide');
  $('.status-control').addClass('playing');

  $('.track-title, .comments-list').html();
  playingElements.removeClass('hide');

  SC.whenStreamingReady(function() {
    track = SC.stream('/tracks/' + trackID, {
      autoPlay: false
    }, function(track) {
      $.get(host + '/tracks/' + trackID + '?consumer_key=' + consumerKey, function(data) {
        $('body').addClass('trackloaded');
        if (!isHistory) {
          history.pushState('', 'New ID: ' + data.id, '/#/' + data.id + '/' + data.permalink);
        }
        document.title = data.title + ' | ScrollPlay';
        setArtwork(data);
        setTimeline(data);
        track.play({
          whileplaying: function() {
            updateProgress();
          },
          onfinish: function() {
            $('.status-control').toggleClass('playing');
          }
        });
        $('.header-top-row').removeClass('collapsed');
      }).fail(function() {
        playingElements.addClass('hide');
        $('.search-toggle').trigger('click');
        $('.search-results').addClass('filled').html('Track not found. Search again.');
      });
    });
  });
}

function loadTrackFromURL(url, isHistory) {
  var regexTrack = new RegExp('(#)\/([0-9]+)');
  if (regexTrack.exec(url)) {
    loadTrack(regexTrack.exec(url)[2], isHistory);
    return true;
  } else {
    return false;
  }
}

$(document).ready(function() {

  if (window.location.hash) {
    loadTrackFromURL(window.location.hash);
  }

  $('.status-control').click(function() {
    if (track.position >= track.duration) {
      loadTrack();
    } else {
      track.togglePause();
    }
    $(this).toggleClass('playing');
  });

  $('.progress-bar').click(function(e) {
    setPosition((e.pageX / $(window).width()) * track.durationEstimate);
  });

  $('.search-toggle').click(function() {
    $('.search-wrap').toggleClass('hide');
    $('#search-input').focus();
  });

  $('#search-input').bind('propertychange change click keyup input paste', function() {
    var searchQuery = $(this).val();
    if (searchQuery.length === 0) {
      $('.search-results').html('');
      $('.search-results').removeClass('filled');
    } else if (searchQuery.length > 2) {
      SC.get('/tracks?consumer_key=' + consumerKey, { q: searchQuery }, function(tracks) {
        var searchResultsHTML = '';
        if (tracks.length <= 1) {
          searchResultsHTML = 'No tracks found.';
        } else {
          for (var i = 0; i < 5; i++) {
            if (tracks[i].streamable === true) {
              searchResultsHTML += '<div class="search-track" data-trackid="' + tracks[i].id + '">';
              if (tracks[i].artwork_url) {
                searchResultsHTML += '<img src="' + tracks[i].artwork_url + '">';
              }
              searchResultsHTML += '<div class="meta"><div class="meta-title">' + tracks[i].title + '</div><div class="meta-artist">by ' + tracks[i].user.username + '</div></div></div>';
            }
            if (i == tracks.length - 1) {
              break;
            }
          }
        }
        $('.search-results').addClass('filled');
        $('.search-results').html(searchResultsHTML).promise().done(function() {
          $('.search-track').click(function() {
            loadTrack($(this).data('trackid'));
          });
        });
      });
    }
  });

  $.fn.drags = function(opt) {
  	opt = $.extend({
  		handle: '',
  		cursor: 'move'
  	}, opt);

    var $el;

  	if (opt.handle === '') {
      $el = this;
  	} else {
      $el = this.find(opt.handle);
  	}

  	return $el.css('cursor', opt.cursor).on('mousedown', function(e) {
      var $drag;
  		if (opt.handle === '') {
        $drag = $(this).addClass('draggable');
  		} else {
        $drag = $(this).addClass('active-handle').parent().addClass('draggable');
  		}
  		var z_idx = $drag.css('z-index'),
  			drg_h = $drag.outerHeight(),
  			drg_w = $drag.outerWidth(),
  			pos_y = $drag.offset().top + drg_h - e.pageY,
  			pos_x = $drag.offset().left + drg_w - e.pageX;
  		$drag.css('z-index', 1000).parents().on('mousemove', function(e) {
        var finalX;
        var finalY;
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        if (e.pageX + pos_x > windowWidth) {
          finalX = windowWidth - drg_w;
        } else if ($drag.position().left < 0) {
          finalX = 0;
        } else {
          finalX = e.pageX + pos_x - drg_w;
        }
        if ($drag.position().top < 0) {
          finalY = 0;
        } else {
          finalY = e.pageY + pos_y - drg_h;
        }
  			$('.draggable').offset({
  				top: finalY,
  				left: finalX
  			}).on('mouseup', function() {
  				$(this).removeClass('draggable').css('z-index', z_idx);
  			});
  		});
  		e.preventDefault();
  	}).on('mouseup', function() {
  		if (opt.handle === '') {
  			$(this).removeClass('draggable');
  		} else {
  			$(this).removeClass('active-handle').parent().removeClass('draggable');
  		}
  	});

  };

  $('header').drags();

});

$(window).on('popstate', function(e) {
  loadTrackFromURL(window.location.hash, true);
  $('.search-wrap').addClass('hide');
});

$('body').on('DOMMouseScroll mousewheel', function(e) {
  if ($('body').hasClass('trackloaded')) {
    if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
      setPosition(track.position + 100);
    } else {
      setPosition(track.position - 100);
    }
  }
  return false;
});
