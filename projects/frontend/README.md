# MusicShare Frontend
## Pitfalls
### `connect()` and `withRouter`
To make this combination work, the order has to be `withRouter(connect(mapStateToProps)(MainViewSidebarLeftComponent))`,
not `connect(mapStateToProps)(withRouter(MainViewSidebarLeftComponent))`!