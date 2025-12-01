import { updateCredentials } from "#features/auth-slice";
import { store } from "redux-tps/store";
import { axiosInstance } from "services/axios-config";

(function () {
	const { pathname } = window.location;
	window.onload = function () {
		if (!pathname.includes('admin') && sessionStorage.getItem('user')) {
			const user = JSON.parse(sessionStorage.getItem('user'));
			if (user.token) {
				axiosInstance.get('/auth/me', {
					headers: {
						Authorization: `Bearer ${user.token}`
					}
				})
					.then((data) => {
						const user = data?.dt;
						if (user) {
							store.dispatch(updateCredentials(user))
						}
					})
					.catch((err) => {
						console.error('Lỗi', err);
						sessionStorage.removeItem('user');
					});
			}
		}
		window.setTimeout(fadeout, 500);
	}

	//===== Prealoder
	const fadeout = () => {
		document.querySelector('.preloader').style.opacity = '0';
		document.querySelector('.preloader').style.display = 'none';
	}


	// Preloader functionality
	window.addEventListener("load", function () {
		const preloader = document.querySelector(".preloader");
		if (preloader) {
			preloader.classList.add("loaded");
			setTimeout(() => {
				preloader.style.display = "none";
			}, 500);
		}
	});

	// Smooth scroll for anchor links
	document.addEventListener("DOMContentLoaded", function () {
		// Add smooth scroll behavior to scroll-top button
		const scrollTop = document.querySelector(".scroll-top");
		if (scrollTop) {
			scrollTop.addEventListener("click", (e) => {
				e.preventDefault();
				window.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			});

			// Show/hide scroll-top button based on scroll position
			window.addEventListener("scroll", () => {
				if (window.pageYOffset > 300) {
					scrollTop.style.display = "flex";
				} else {
					scrollTop.style.display = "none";
				}
			});
			console.log("Scroll-top button initialized.");
		}
	});
})();