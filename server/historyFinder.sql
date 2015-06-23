CREATE TABLE IF NOT EXISTS `historyUser` (
  `userid` int(10) NOT NULL,
  `username` varchar(20) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

ALTER TABLE `historyUser`
 ADD PRIMARY KEY (`userid`);


CREATE TABLE IF NOT EXISTS `historyFinder` (
  `userid` int(10) NOT NULL,
  `urlid` int(10) NOT NULL,
  `url` text NOT NULL,
  `title` text NOT NULL,
  `text` text NOT NULL,
  `lastVisitTime` double NOT NULL,
  `visitCount` int(10) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

ALTER TABLE `historyFinder`
 ADD PRIMARY KEY (`userid`,`urlid`), ADD FULLTEXT KEY `combine` (`title`,`text`);