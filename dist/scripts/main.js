function setTimeline(t){$(".track-title").html(t.user.username+' &mdash; "'+t.title+'"'),$(".comments-list").css("height",Math.round(t.duration*magnitude)),$(".comments-list .comment").remove(),$.get(host+"/tracks/"+t.id+"/comments?consumer_key="+consumerKey,function(t){t.sort(function(t,a){return parseFloat(t.timestamp)-parseFloat(a.timestamp)});for(var a,e=0,s=0;s<t.length;s++){var r=Math.round(t[s].timestamp*magnitude);e+a>r&&(r=e+a);var o=t[s].user.avatar_url;o=o.replace("-large.jpg","-badge.jpg"),$(".comments-list").append('<div id="comment-'+t[s].id+'" class="comment" style="top: '+r+'px;"><img class="avatar" src="'+o+'">'+t[s].user.username+": "+t[s].body+"</div>"),a=$(".comments-list .comment").last().outerHeight(),e=r}})}function updateProgress(t){var a;a=t>=0?t:track.position,$(".bar-progress").css("width",a/track.durationEstimate*100+"%"),$(".comments-progress").css("top",Math.round(a*magnitude)+"px");var e=$(".comments-progress").position().top,s=$(window).height()/2,r=e-s;Math.abs(r)>=0&&container.animate({scrollTop:r},0)}function setArtwork(t){if(t.artwork_url){var a=t.artwork_url;a=a.replace("-large.jpg","-t500x500.jpg"),container.css("background-image","url("+a+")")}}function loadTrack(t,a){track&&track.destruct(),SC.initialize({client_id:consumerKey}),$(".search-wrap").toggleClass("hide"),$(".status-control").addClass("playing"),$(".track-title, .comments-list").html(),playingElements.removeClass("hide"),SC.whenStreamingReady(function(){track=SC.stream("/tracks/"+t,{autoPlay:!1},function(e){$.get(host+"/tracks/"+t+"?consumer_key="+consumerKey,function(t){a||history.pushState("","New ID: "+t.id,"/#/"+t.id+"/"+t.permalink),document.title=t.title+" | ScrollPlay",setArtwork(t),setTimeline(t),e.play({whileplaying:function(){updateProgress()},onfinish:function(){$(".status-control").toggleClass("playing")}})}).fail(function(){playingElements.addClass("hide"),$(".search-toggle").trigger("click"),$(".search-results").addClass("filled").html("Track not found. Search again.")})})})}function loadTrackFromURL(t,a){var e=new RegExp("(#)/([0-9]+)");return e.exec(t)?(loadTrack(e.exec(t)[2],a),!0):!1}var consumerKey="9994e3c432c77379bee441c98b1a4082",host="https://api.soundcloud.com",magnitude=.1,container=$(".wrapper"),track,SC,playingElements=$(".progress-bar, .controls, .comments-progress");$(document).ready(function(){window.location.hash&&loadTrackFromURL(window.location.hash),$(".status-control").click(function(){track.position>=track.duration?loadTrack():track.togglePause(),$(this).toggleClass("playing")}),$(".progress-bar").click(function(t){var a=t.pageX/$(window).width()*track.durationEstimate;track.setPosition(a),updateProgress(a)}),$(".search-toggle").click(function(){$(".search-wrap").toggleClass("hide"),$("#search-input").focus()}),$("#search-input").bind("propertychange change click keyup input paste",function(){var t=$(this).val();0===t.length?($(".search-results").html(""),$(".search-results").removeClass("filled")):t.length>2&&SC.get("/tracks?consumer_key="+consumerKey,{q:t},function(t){var a="";if(t.length<=1)a="No tracks found.";else for(var e=0;5>e&&(t[e].streamable===!0&&(a+='<div class="search-track" data-trackid="'+t[e].id+'">',t[e].artwork_url&&(a+='<img src="'+t[e].artwork_url+'">'),a+='<div class="meta"><div class="meta-title">'+t[e].title+'</div><div class="meta-artist">by '+t[e].user.username+"</div></div></div>"),e!=t.length-1);e++);$(".search-results").addClass("filled"),$(".search-results").html(a).promise().done(function(){$(".search-track").click(function(){loadTrack($(this).data("trackid"))})})})})}),$(window).on("popstate",function(){loadTrackFromURL(window.location.hash,!0),$(".search-wrap").addClass("hide")});