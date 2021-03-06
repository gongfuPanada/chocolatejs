// Generated by CoffeeScript 1.9.2
(function() {
  var Actor, Document, Interface, Workflow, _, _module,
    slice = [].slice;

  _ = require('../../general/chocodash');

  Interface = require('../locco/interface');

  Workflow = require('../locco/workflow');

  Document = require('../locco/document');

  Actor = _.prototype({
    adopt: {
      go: function(who, where, callback) {
        return _.go(who[where], function() {
          callback.apply(who, arguments);
          if (who.stage.is_ready()) {
            return who.status.notify(Workflow.Status.Public);
          }
        });
      },
      awake: function(uuid, __) {
        var publisher;
        if (typeof window === "undefined" || window === null) {
          if ((uuid != null) && (__.session.frozen != null) && (__.session.frozen[uuid] == null)) {
            return void 0;
          }
          publisher = new _.Publisher;
          __.space.read(uuid, function(frozen) {
            return publisher.notify(frozen);
          });
          return publisher;
        }
      }
    },
    constructor: function(options) {
      var _bind, doc, k, ref, v, when_ready;
      when_ready = new _.Publisher;
      this.ready = function(callback) {
        return when_ready.subscribe(((function(_this) {
          return function() {
            return callback.call(_this);
          };
        })(this)));
      };
      this.stage = (ref = options != null ? options.workflow : void 0) != null ? ref : Workflow.main;
      when_ready.subscribe(((function(_this) {
        return function() {
          return _this.stage.enter(_this);
        };
      })(this)));
      if (typeof window !== "undefined" && window !== null) {
        this.stage.ready((function(_this) {
          return function() {
            return _this.stage.call(_this, 'awake', options != null ? options.uuid : void 0, {
              how: 'json'
            }, function(frozen) {
              var k, v;
              if (frozen != null) {
                for (k in frozen) {
                  v = frozen[k];
                  _this[k] = v;
                }
              }
              return when_ready.notify();
            });
          };
        })(this));
      } else {
        setTimeout((function() {
          return when_ready.notify();
        }), 0);
      }
      for (k in this) {
        v = this[k];
        if (v instanceof Document) {
          doc = v;
          break;
        }
      }
      if (doc == null) {
        doc = new Document({});
      }
      this.document = doc;
      for (k in this) {
        v = this[k];
        if (v instanceof Actor) {
          _["do"].internal(v, 'parent', this);
        }
      }
      _bind = (function(_this) {
        return function(o) {
          for (k in o) {
            v = o[k];
            if (v instanceof Interface) {
              v.bind(_this, doc, k);
            } else if ((v != null ? v.constructor : void 0) === {}.constructor) {
              _bind(v);
            }
          }
        };
      })(this);
      _bind(this);
    },
    id: function() {
      var ref, ref1;
      if (((ref = this._) != null ? (ref1 = ref._) != null ? ref1.uuid : void 0 : void 0) == null) {
        _["do"].identify(this, {
          filter: [Document]
        });
      }
      return this._._.uuid;
    },
    status: new _.Publisher,
    submit: function() {
      var params, publisher, ref, service;
      service = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      publisher = new _.Publisher;
      if ((typeof window !== "undefined" && window !== null) && this.stage.is_ready()) {
        (ref = this.stage).call.apply(ref, [this, service].concat(slice.call(params), [function(data) {
          return publisher.notify(data);
        }]));
      } else {
        setTimeout((function() {
          return publisher.notify();
        }), 0);
      }
      return publisher;
    },
    show: function() {},
    area: function(name, id) {
      var k, set, v;
      _["do"].internal(this, 'area', {});
      set = (function(_this) {
        return function(k, v) {
          var area, parent, ref, ref1;
          if (v == null) {
            if (_this._._.area[k] != null) {
              return _this._._.area[k];
            }
            parent = _this;
            while ((parent = (ref = parent._) != null ? (ref1 = ref._) != null ? ref1.parent : void 0 : void 0) != null) {
              if ((area = parent.area(k)) != null) {
                return area;
              }
            }
          } else {
            return _this._._.area[k] = v;
          }
        };
      })(this);
      if (_.isBasicObject(name)) {
        for (k in name) {
          v = name[k];
          set(k, v);
        }
      } else {
        return set(name, id);
      }
    }
  });

  Actor.Web = _.prototype({
    inherit: Actor,
    use: function() {
      var _shown;
      _shown = {};
      return this.show = function(path, source, area) {
        var i, len, ref, step, steps, where;
        steps = path.split('.');
        where = this;
        for (i = 0, len = steps.length; i < len; i++) {
          step = steps[i];
          where = where[step];
          if (where == null) {
            return;
          }
        }
        if (area == null) {
          area = (ref = where.area) != null ? ref : 'inline';
        }
        switch (area) {
          case 'inline':
            return typeof where.submit === "function" ? where.submit(function(result) {
              var ref1, uuid;
              if (((uuid = _shown[path]) == null) || $("#" + uuid).length === 0) {
                uuid = _shown[path] = '_' + _.Uuid();
                result = "<div id='" + uuid + "'>" + result + "</div>";
                if (!source.after) {
                  source = $(source);
                }
                return (ref1 = source.after) != null ? ref1.call(source, result) : void 0;
              }
            }) : void 0;
          case 'view':
            break;
          case 'modal':
            break;
          case 'popup':
        }
      };
    }
  });

  _module = typeof window !== "undefined" && window !== null ? window : module;

  if (_module.exports != null) {
    _module.exports = Actor;
  } else {
    if (window.Locco == null) {
      window.Locco = {};
    }
    window.Locco.Actor = Actor;
  }

}).call(this);
