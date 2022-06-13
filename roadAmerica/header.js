define(["jquery", "jquery.mobile.events", "slick"], function ($) {
    var Header;
    return Header = (function () {
        function Header(options) {
            this.options = options;
            this.options = $.extend({}, this.defaults(), this.options);
            this.delegateEvents();
        }

        Header.prototype.defaults = function () {
            return {
                element: "#header",
                menuToggle: ".nav__toggle-nav",
                logoSwitchBtn: "utilitarian__site-switch",
                logoElements: ["utilitarian__logo-divide", "utilitarian__logo-alt-container"],
                moreLinks: ["more-links__close", "cta-list__link--more"],
                moreLinksPanel: "more-links",
                navState: "nav-open",
                searchState: "search-open",
                navPrimary: "nav__primary-link",
                navSecondary: ".nav__primary-link",
                stateCheck: "html",
                searchState: "search-open",
                searchToggle: ["utilitarian__toggle-search", "nav__toggle-search"],
                searchForm: "search-header-bar__search-form",
                searchClose: "search-header-bar__search-form-close",
                nextRaceToggle: "next-race__link",
                nextRaceState: "next-race-open"
            };
        };

        Header.prototype.delegateEvents = function () {
            var logoSwitchBtn, _self;
            _self = this;
            this.options.$element = $(this.options.element);
            this.options.$searchClose = $("." + this.options.searchClose);
            this.options.$stateCheck = $(this.options.stateCheck);
            this.options.$menuToggle = $(this.options.menuToggle);
            this.options.$moreLinksPanel = $("." + this.options.moreLinksPanel);
            this.options.moreLinksPanelActive = this.options.moreLinksPanel + "--active";
            this.options.$nextRaceToggle = $("." + this.options.nextRaceToggle);
            this.options.$navSecondary = $(this.options.navSecondary);
            logoSwitchBtn = $("." + this.options.logoSwitchBtn);
            logoSwitchBtn.on("click", (function (_this) {
                return function () {
                    if (logoSwitchBtn.hasClass(_self.options.logoSwitchBtn + "--active")) {
                        $.each(_self.options.logoElements, function (i, el) {
                            var activeEl;
                            activeEl = $("." + el + "--active");
                            return activeEl.removeClass(el + "--active");
                        });
                        return logoSwitchBtn.removeClass(_self.options.logoSwitchBtn + "--active");
                    } else {
                        $.each(_self.options.logoElements, function (i, el) {
                            var ele;
                            ele = $("." + el);
                            return ele.addClass(el + "--active");
                        });
                        return logoSwitchBtn.addClass(_self.options.logoSwitchBtn + "--active");
                    }
                };
            })(this));
            this.options.$nextRaceToggle.on("click", (function (_this) {
                return function (e) {
                    e.preventDefault();
                    $('#raceInfo').toggleClass('next-race__race-info--active');
                    if ($('body').hasClass('next-race-open')) {
                        $('body').toggleClass('next-race-open');
                    }
                    return $('#raceInfoFirst').toggleClass('next-race__race-item--active');
                };
            })(this));
            $.each(this.options.searchToggle, function (i, el) {
                var $el;
                $el = $("." + el);
                return $el.on("click", (function (_this) {
                    return function (e) {
                        e.preventDefault();
                        return _self.options.$stateCheck.toggleClass(_self.options.searchState);
                    };
                })(this));
            });
            this.options.$searchClose.on("click", (function (_this) {
                return function (e) {
                    e.preventDefault();
                    return _this.options.$stateCheck.toggleClass(_this.options.searchState);
                };
            })(this));
            this.options.$menuToggle.on("click", (function (_this) {
                return function (e) {
                    e.preventDefault();
                    _this.options.$stateCheck.removeClass(_this.options.searchState);
                    return _this.options.$stateCheck.toggleClass(_this.options.navState);
                };
            })(this));
            $.each(this.options.$navSecondary, function (i, el) {
                var $el;
                $el = $(el);
                return $el.on("click", (function (_this) {
                    return function (e) {
                        var $mega, $parent;
                        $parent = $(_this).closest(".nav__primary-item");
                        return $mega = $parent.find(".nav__secondary-panel");
                    };
                })(this));
            });
            $(window).on("throttledresize", (function (_this) {
                return function () {
                    $(".nav__secondary-panel").removeClass("nav__secondary-panel--active");
                    return _this.options.$stateCheck.removeClass(_this.options.searchState);
                };
            })(this));
            return $.each(this.options.moreLinks, function (i, el) {
                var moreLinks;
                moreLinks = $("." + el);
                return moreLinks.on("click", (function (_this) {
                    return function (e) {
                        var moreLinksListParent, moreLinksPanel, moreLinksParent;
                        e.preventDefault();
                        moreLinksParent = $(e.currentTarget).closest("." + _self.options.moreLinksPanel + "-parent");
                        moreLinksPanel = moreLinksParent.find("." + _self.options.moreLinksPanel);
                        moreLinksListParent = moreLinksParent.find('.cta-list');
                        moreLinksPanel.toggleClass(_self.options.moreLinksPanelActive);
                        if (moreLinksListParent.length > 0 && moreLinksListParent.hasClass('cta-list--alt')) {
                            return $("body").toggleClass("more-active");
                        }
                    };
                })(this));
            });
        };

        return Header;

    })();
});
